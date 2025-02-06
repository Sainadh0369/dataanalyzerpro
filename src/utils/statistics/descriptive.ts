import { DescriptiveStats } from './core';
import { createError } from '../core/error';

export function calculateDescriptiveStats(values: number[]): DescriptiveStats {
  if (!values.length) {
    throw createError('INVALID_DATA', 'Cannot calculate statistics for empty dataset');
  }

  // Validate all values are finite numbers
  const validValues = values.filter(v => typeof v === 'number' && isFinite(v) && !isNaN(v));
  if (validValues.length === 0) {
    throw createError('INVALID_DATA', 'No valid numeric values found');
  }

  const sortedValues = [...validValues].sort((a, b) => a - b);
  const n = validValues.length;
  
  // Basic measures
  const mean = calculateMean(validValues);
  const variance = calculateVariance(validValues, mean);
  const standardDeviation = Math.sqrt(variance);
  
  // Position measures
  const median = calculateMedian(sortedValues);
  const mode = calculateMode(validValues);
  const quartiles = calculateQuartiles(sortedValues);
  
  // Shape measures
  const skewness = calculateSkewness(validValues, mean, standardDeviation);
  const kurtosis = calculateKurtosis(validValues, mean, standardDeviation);
  
  // Spread measures
  const range = sortedValues[n - 1] - sortedValues[0];
  const iqr = quartiles.q3 - quartiles.q1;

  return {
    mean,
    median,
    mode,
    variance,
    standardDeviation,
    skewness,
    kurtosis,
    quartiles,
    range,
    iqr
  };
}

function calculateMean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateMedian(sortedValues: number[]): number {
  const mid = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2 
    ? sortedValues[mid] 
    : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
}

function calculateMode(values: number[]): number[] {
  const counts = new Map<number, number>();
  values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  
  let maxCount = 0;
  const modes: number[] = [];
  
  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      modes.length = 0;
      modes.push(value);
    } else if (count === maxCount) {
      modes.push(value);
    }
  });
  
  return modes;
}

function calculateVariance(values: number[], mean: number): number {
  return values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
}

function calculateSkewness(values: number[], mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  const n = values.length;
  const cubedDeviations = values.map(v => Math.pow((v - mean) / stdDev, 3));
  return (n / ((n - 1) * (n - 2))) * cubedDeviations.reduce((a, b) => a + b, 0);
}

function calculateKurtosis(values: number[], mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  const n = values.length;
  const fourthMoment = values.reduce((acc, val) => 
    acc + Math.pow((val - mean) / stdDev, 4), 0) / n;
  return fourthMoment - 3; // Excess kurtosis
}

function calculateQuartiles(sortedValues: number[]): { q1: number; q2: number; q3: number } {
  const q2 = calculateMedian(sortedValues);
  const lowerHalf = sortedValues.slice(0, Math.floor(sortedValues.length / 2));
  const upperHalf = sortedValues.slice(Math.ceil(sortedValues.length / 2));
  
  return {
    q1: calculateMedian(lowerHalf),
    q2,
    q3: calculateMedian(upperHalf)
  };
}