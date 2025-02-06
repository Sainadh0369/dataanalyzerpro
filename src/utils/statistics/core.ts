import { DataField } from '../../types';
import { validateNumericData } from './validation';
import { calculateDescriptiveStats } from './descriptive';
import { calculateCorrelations } from './correlation';
import { createError } from '../core/error';

export interface StatisticalAnalysis {
  descriptive: Record<string, DescriptiveStats>;
  correlations: Record<string, number>;
  summary: {
    totalFields: number;
    numericFields: number;
    sampleSize: number;
  };
}

export interface DescriptiveStats {
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  standardDeviation: number;
  skewness: number;
  kurtosis: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  range: number;
  iqr: number;
}

export function performStatisticalAnalysis(fields: DataField[]): StatisticalAnalysis {
  try {
    // Validate input data
    validateNumericData(fields);

    const numericFields = fields.filter(field => field.type === 'number');
    const descriptiveStats: Record<string, DescriptiveStats> = {};

    // Calculate descriptive statistics for each numeric field
    numericFields.forEach(field => {
      try {
        const values = field.value as number[];
        descriptiveStats[field.name] = calculateDescriptiveStats(values);
      } catch (error) {
        console.error(`Error calculating stats for ${field.name}:`, error);
        throw createError(
          'ANALYSIS_FAILED',
          `Failed to analyze field ${field.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });

    // Calculate correlations between numeric fields
    const correlations = calculateCorrelations(numericFields);

    return {
      descriptive: descriptiveStats,
      correlations,
      summary: {
        totalFields: fields.length,
        numericFields: numericFields.length,
        sampleSize: numericFields[0]?.value.length || 0
      }
    };
  } catch (error) {
    console.error('Statistical analysis error:', error);
    throw error instanceof Error ? error : createError('ANALYSIS_FAILED', 'Failed to perform statistical analysis');
  }
}