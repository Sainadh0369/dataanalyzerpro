import { DataField } from '../types/data';

export function calculateStatistics(fields: DataField[]) {
  const numericFields = fields.filter(field => field.type === 'number');
  
  const statistics = {
    mean: {},
    median: {},
    standardDeviation: {},
    correlations: {}
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
    statistics.correlations = calculateCorrelations(numericFields);
  }

  return statistics;
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
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(calculateMean(squareDiffs));
}

function calculateCorrelations(fields: DataField[]): Record<string, number> {
  const correlations: Record<string, number> = {};
  
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const field1 = fields[i];
      const field2 = fields[j];
      const correlation = calculatePearsonCorrelation(
        field1.value as number[],
        field2.value as number[]
      );
      correlations[`${field1.name}_${field2.name}`] = correlation;
    }
  }
  
  return correlations;
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const mean1 = calculateMean(x);
  const mean2 = calculateMean(y);
  
  const diff1 = x.map(val => val - mean1);
  const diff2 = y.map(val => val - mean2);
  
  const sum1 = diff1.reduce((sum, val) => sum + Math.pow(val, 2), 0);
  const sum2 = diff2.reduce((sum, val) => sum + Math.pow(val, 2), 0);
  
  const diffProd = diff1.reduce((sum, val, i) => sum + val * diff2[i], 0);
  
  return diffProd / Math.sqrt(sum1 * sum2);
}