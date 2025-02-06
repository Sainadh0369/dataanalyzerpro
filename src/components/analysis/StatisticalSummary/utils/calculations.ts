import { DataField } from '../../../../types';

export function calculateFieldStats(field: DataField) {
  const values = field.value as number[];
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  
  if (validValues.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      sampleSize: 0,
      trend: 'stable' as const
    };
  }

  const mean = calculateMean(validValues);
  const median = calculateMedian(validValues);
  const stdDev = calculateStandardDeviation(validValues, mean);
  const { min, max } = calculateMinMax(validValues);
  const trend = determineTrend(validValues);

  return {
    mean,
    median,
    stdDev,
    min,
    max,
    sampleSize: validValues.length,
    trend
  };
}

export function calculateMean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateStandardDeviation(values: number[], mean: number): number {
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

export function calculateMinMax(values: number[]): { min: number; max: number } {
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

export function determineTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstMean = calculateMean(firstHalf);
  const secondMean = calculateMean(secondHalf);
  
  const threshold = Math.abs(firstMean) * 0.05;
  const difference = secondMean - firstMean;
  
  if (Math.abs(difference) <= threshold) return 'stable';
  return difference > 0 ? 'up' : 'down';
}