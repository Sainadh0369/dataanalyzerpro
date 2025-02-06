import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DataField } from '../../types';
import { calculateMean } from './calculations';
import type { Trend, FieldStatistics } from './types';

export function analyzeField(field: DataField): FieldStatistics {
  const values = field.value as number[];
  const mean = calculateMean(values);
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : 
    (sorted[Math.floor(sorted.length / 2) - 1] + sorted[Math.floor(sorted.length / 2)]) / 2;
  
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  
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

export function determineTrend(values: number[]): Trend {
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

export function getTrendIcon(trend: Trend) {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    default: return Minus;
  }
}

export function getTrendColor(trend: Trend): string {
  switch (trend) {
    case 'up': return 'text-green-500';
    case 'down': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

export function getTrendLabel(trend: Trend): string {
  switch (trend) {
    case 'up': return 'Upward Trend';
    case 'down': return 'Downward Trend';
    default: return 'Stable Trend';
  }
}