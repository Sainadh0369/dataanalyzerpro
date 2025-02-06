import { Trend } from './trends';

export function formatNumber(value: number): string {
  if (!isFinite(value)) return '0.00';
  
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  }
  if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  }
  return value.toFixed(2);
}

export function getTrendDescription(values: number[]): string {
  if (values.length < 2) return 'a stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const threshold = Math.abs(firstMean) * 0.05;
  const difference = secondMean - firstMean;
  
  if (Math.abs(difference) <= threshold) return 'a stable';
  return difference > 0 ? 'an increasing' : 'a decreasing';
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}