import { DataField } from '@/types/data';
import { createError } from '@/utils/core/error';

interface CleaningResult {
  field: DataField;
  fixes: {
    type: string;
    count: number;
    description: string;
  }[];
  healthScore: number;
}

export class DataCleaner {
  static async cleanData(fields: DataField[]): Promise<{
    fields: DataField[];
    results: CleaningResult[];
    overallHealth: number;
  }> {
    const results: CleaningResult[] = [];
    const cleanedFields: DataField[] = [];

    for (const field of fields) {
      const result = await this.cleanField(field);
      results.push(result);
      cleanedFields.push(result.field);
    }

    const overallHealth = this.calculateOverallHealth(results);

    return {
      fields: cleanedFields,
      results,
      overallHealth
    };
  }

  private static async cleanField(field: DataField): Promise<CleaningResult> {
    const fixes: CleaningResult['fixes'] = [];
    let cleanedValues = [...field.value];
    
    // Handle missing values
    const missingCount = this.handleMissingValues(cleanedValues);
    if (missingCount > 0) {
      fixes.push({
        type: 'missing_values',
        count: missingCount,
        description: `Filled ${missingCount} missing values`
      });
    }

    // Remove duplicates
    const initialLength = cleanedValues.length;
    cleanedValues = this.removeDuplicates(cleanedValues);
    const duplicateCount = initialLength - cleanedValues.length;
    if (duplicateCount > 0) {
      fixes.push({
        type: 'duplicates',
        count: duplicateCount,
        description: `Removed ${duplicateCount} duplicate values`
      });
    }

    // Handle type-specific cleaning
    switch (field.type) {
      case 'number':
        const numericResults = this.cleanNumericValues(cleanedValues as number[]);
        cleanedValues = numericResults.values;
        fixes.push(...numericResults.fixes);
        break;
      case 'string':
        const textResults = this.cleanTextValues(cleanedValues as string[]);
        cleanedValues = textResults.values;
        fixes.push(...textResults.fixes);
        break;
      case 'date':
        const dateResults = this.cleanDateValues(cleanedValues);
        cleanedValues = dateResults.values;
        fixes.push(...dateResults.fixes);
        break;
    }

    const healthScore = this.calculateFieldHealth(cleanedValues, fixes);

    return {
      field: {
        ...field,
        value: cleanedValues
      },
      fixes,
      healthScore
    };
  }

  private static handleMissingValues(values: any[]): number {
    let missingCount = 0;
    
    for (let i = 0; i < values.length; i++) {
      if (values[i] == null || values[i] === '') {
        missingCount++;
        // Use previous non-null value or next non-null value
        const prevValue = values.slice(0, i).findLast(v => v != null);
        const nextValue = values.slice(i + 1).find(v => v != null);
        values[i] = prevValue ?? nextValue ?? 0;
      }
    }

    return missingCount;
  }

  private static removeDuplicates(values: any[]): any[] {
    return Array.from(new Set(values));
  }

  private static cleanNumericValues(values: number[]): {
    values: number[];
    fixes: CleaningResult['fixes'];
  } {
    const fixes: CleaningResult['fixes'] = [];
    let cleanedValues = values;

    // Handle outliers
    const { mean, stdDev } = this.calculateStats(cleanedValues);
    const outlierThreshold = 3; // 3 standard deviations
    const initialLength = cleanedValues.length;
    
    cleanedValues = cleanedValues.map(value => {
      const zScore = Math.abs((value - mean) / stdDev);
      if (zScore > outlierThreshold) {
        return mean; // Replace outliers with mean
      }
      return value;
    });

    const outlierCount = initialLength - cleanedValues.length;
    if (outlierCount > 0) {
      fixes.push({
        type: 'outliers',
        count: outlierCount,
        description: `Handled ${outlierCount} outliers`
      });
    }

    return { values: cleanedValues, fixes };
  }

  private static cleanTextValues(values: string[]): {
    values: string[];
    fixes: CleaningResult['fixes'];
  } {
    const fixes: CleaningResult['fixes'] = [];
    let cleanedValues = values;
    let inconsistentCount = 0;

    // Trim whitespace and normalize case
    cleanedValues = cleanedValues.map(value => {
      const original = value;
      const cleaned = value.trim();
      if (cleaned !== original) inconsistentCount++;
      return cleaned;
    });

    if (inconsistentCount > 0) {
      fixes.push({
        type: 'formatting',
        count: inconsistentCount,
        description: `Fixed formatting in ${inconsistentCount} values`
      });
    }

    return { values: cleanedValues, fixes };
  }

  private static cleanDateValues(values: any[]): {
    values: Date[];
    fixes: CleaningResult['fixes'];
  } {
    const fixes: CleaningResult['fixes'] = [];
    let invalidCount = 0;
    
    const cleanedValues = values.map(value => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        invalidCount++;
        return null;
      }
      return date;
    }).filter((date): date is Date => date !== null);

    if (invalidCount > 0) {
      fixes.push({
        type: 'invalid_dates',
        count: invalidCount,
        description: `Removed ${invalidCount} invalid dates`
      });
    }

    return { values: cleanedValues, fixes };
  }

  private static calculateStats(values: number[]): { mean: number; stdDev: number } {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
    return { mean, stdDev };
  }

  private static calculateFieldHealth(values: any[], fixes: CleaningResult['fixes']): number {
    const totalIssues = fixes.reduce((sum, fix) => sum + fix.count, 0);
    const totalValues = values.length;
    
    if (totalValues === 0) return 0;
    
    // Calculate health score (0-100)
    const baseScore = 100;
    const deductionPerIssue = 100 / totalValues;
    const healthScore = Math.max(0, baseScore - (totalIssues * deductionPerIssue));
    
    return Math.round(healthScore);
  }

  private static calculateOverallHealth(results: CleaningResult[]): number {
    if (results.length === 0) return 0;
    return Math.round(
      results.reduce((sum, result) => sum + result.healthScore, 0) / results.length
    );
  }
}