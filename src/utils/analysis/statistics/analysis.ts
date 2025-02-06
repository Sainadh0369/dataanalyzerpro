import { DataField } from '../../../types';
import { calculateMean, calculateMedian, calculateStandardDeviation } from './calculations';
import { determineTrend } from './trends';
import type { FieldStatistics, AnalyzedData } from '../../../types';
import { calculateCorrelations } from './correlation';

export function analyzeField(field: DataField): FieldStatistics {
  const values = field.value as number[];
  const mean = calculateMean(values);
  const median = calculateMedian(values);
  const stdDev = calculateStandardDeviation(values, mean);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const trend = determineTrend(values);
  
  return {
    mean,
    median,
    stdDev,
    min,
    max,
    sampleSize: values.length,
    trend
  };
}

export async function analyzeFields(fields: DataField[]): Promise<AnalyzedData> {
  const numericFields = fields.filter(f => f.type === 'number');
  const textFields = fields.filter(f => f.type === 'string');

  // Calculate statistics for numeric fields
  const fieldStats = numericFields.map(field => analyzeField(field));
  const correlations = numericFields.length >= 2 ? calculateCorrelations(numericFields) : {};

  return {
    fields,
    statistics: {
      mean: Object.fromEntries(fieldStats.map(s => [s.fieldName, s.mean])),
      median: Object.fromEntries(fieldStats.map(s => [s.fieldName, s.median])),
      standardDeviation: Object.fromEntries(fieldStats.map(s => [s.fieldName, s.stdDev])),
      correlations
    },
    insights: [],
    hasNumericData: numericFields.length > 0,
    hasTextData: textFields.length > 0,
    dataQuality: {
      completeness: calculateCompleteness(fields),
      validity: calculateValidity(fields)
    }
  };
}

function calculateCompleteness(fields: DataField[]): number {
  const totalValues = fields.reduce((sum, field) => sum + field.value.length, 0);
  const nonNullValues = fields.reduce((sum, field) => 
    sum + field.value.filter(v => v != null && v !== '').length, 0);
  return totalValues > 0 ? nonNullValues / totalValues : 0;
}

function calculateValidity(fields: DataField[]): number {
  const totalValues = fields.reduce((sum, field) => sum + field.value.length, 0);
  const validValues = fields.reduce((sum, field) => 
    sum + field.value.filter(v => {
      if (field.type === 'number') return typeof v === 'number' && !isNaN(v);
      if (field.type === 'string') return typeof v === 'string' && v.trim() !== '';
      return v != null;
    }).length, 0);
  return totalValues > 0 ? validValues / totalValues : 0;
}