import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calculateMean } from './calculations';

export type Trend = 'up' | 'down' | 'stable';

export function determineTrend(values: number | number[]): Trend {
  // Handle single value case
  if (typeof values === 'number') return 'stable';
  
  // Handle array case
  if (!Array.isArray(values) || values.length < 2) return 'stable';
  
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