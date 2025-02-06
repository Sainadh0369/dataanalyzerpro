import { DataField } from '../core/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { createError } from '../core/error';

export function calculateFieldStats(field: DataField) {
  const values = field.value as number[];
  const mean = calculateMean(values);
  const median = calculateMedian(values);
  const stdDev = calculateStandardDeviation(values);
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

export function calculateStatistics(fields: DataField[]) {
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

export function performStatisticalAnalysis(fields: DataField[]) {
  try {
    return calculateStatistics(fields);
  } catch (error) {
    throw createError('ANALYSIS_ERROR', 'Failed to perform statistical analysis');
  }
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

export function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    default: return Minus;
  }
}

export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up': return 'text-green-500';
    case 'down': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

export function getTrendLabel(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up': return 'Upward Trend';
    case 'down': return 'Downward Trend';
    default: return 'Stable Trend';
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

function calculateCorrelation(x: number[], y: number[]): number {
  const mean1 = calculateMean(x);
  const mean2 = calculateMean(y);
  
  const diff1 = x.map(val => val - mean1);
  const diff2 = y.map(val => val - mean2);
  
  const sum1 = diff1.reduce((sum, val) => sum + Math.pow(val, 2), 0);
  const sum2 = diff2.reduce((sum, val) => sum + Math.pow(val, 2), 0);
  
  const diffProd = diff1.reduce((sum, val, i) => sum + val * diff2[i], 0);
  
  return diffProd / Math.sqrt(sum1 * sum2);
}