import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DataField } from '@types/data';

interface FieldStatsProps {
  field: DataField;
}

export function FieldStats({ field }: FieldStatsProps) {
  const values = field.value as number[];
  const stats = analyzeField(values);
  const TrendIcon = getTrendIcon(stats.trend);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">{field.name}</h4>
      
      <div className="flex items-center gap-2 mb-4">
        <TrendIcon className={getTrendColor(stats.trend)} />
        <span className="text-sm text-gray-600">
          {getTrendLabel(stats.trend)}
        </span>
      </div>

      <div className="space-y-2">
        <StatRow label="Sample Size" value={values.length.toString()} />
        <StatRow label="Mean" value={formatNumber(stats.mean)} />
        <StatRow label="Median" value={formatNumber(stats.median)} />
        <StatRow label="Std Dev" value={formatNumber(stats.stdDev)} />
        <StatRow label="Min" value={formatNumber(stats.min)} />
        <StatRow label="Max" value={formatNumber(stats.max)} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function analyzeField(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : 
    (sorted[Math.floor(sorted.length / 2) - 1] + sorted[Math.floor(sorted.length / 2)]) / 2;
  
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  
  return {
    mean,
    median,
    stdDev,
    min: Math.min(...values),
    max: Math.max(...values),
    trend: determineTrend(values)
  };
}

function determineTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const threshold = Math.abs(firstMean) * 0.05;
  const difference = secondMean - firstMean;
  if (Math.abs(difference) <= threshold) return 'stable';
  return difference > 0 ? 'up' : 'down';
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    default: return Minus;
  }
}

function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up': return 'text-green-500';
    case 'down': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

function getTrendLabel(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up': return 'Upward Trend';
    case 'down': return 'Downward Trend';
    default: return 'Stable Trend';
  }
}

function formatNumber(value: number): string {
  if (!isFinite(value)) return '0.00';
  
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  }
  if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  }
  return value.toFixed(2);
}