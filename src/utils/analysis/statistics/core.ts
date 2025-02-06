import { DataField } from '@/types/data';
import { createError } from '@/utils/core/error';

export function performStatisticalAnalysis(fields: DataField[]) {
  try {
    return calculateStatistics(fields);
  } catch (error) {
    throw createError('ANALYSIS_ERROR', 'Failed to perform statistical analysis');
  }
}

function calculateMean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateStandardDeviation(values: number[]): number {
  const mean = calculateMean(values);
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(calculateMean(squaredDiffs));
}

function calculateStatistics(fields: DataField[]) {
  const numericFields = fields.filter(field => field.type === 'number');
  
  const statistics = {
    mean: {} as Record<string, number>,
    median: {} as Record<string, number>,
    standardDeviation: {} as Record<string, number>,
    correlations: {} as Record<string, number>
  };

  // Calculate statistics for numeric fields
  numericFields.forEach(field => {
    const values = field.value as number[];
    if (values.length > 0) {
      statistics.mean[field.name] = calculateMean(values);
      statistics.median[field.name] = calculateMedian(values);
      statistics.standardDeviation[field.name] = calculateStandardDeviation(values);
    }
  });

  // Calculate correlations between numeric fields
  if (numericFields.length > 1) {
    for (let i = 0; i < numericFields.length; i++) {
      for (let j = i + 1; j < numericFields.length; j++) {
        const field1 = numericFields[i];
        const field2 = numericFields[j];
        const key = `${field1.name}_${field2.name}`;
        statistics.correlations[key] = calculateCorrelation(
          field1.value as number[],
          field2.value as number[]
        );
      }
    }
  }

  return statistics;
}