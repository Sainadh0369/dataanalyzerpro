import React from 'react';
import { calculateFieldStats, getTrendIcon, getTrendColor, getTrendLabel } from '@utils/analysis/statistics';
import { formatNumber } from '@utils/analysis/statistics/formatting';
import { StatRow } from './StatRow';
import type { FieldStatsProps } from '../types';

export function FieldStats({ field }: FieldStatsProps) {
  const stats = calculateFieldStats(field);
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
        <StatRow label="Sample Size" value={stats.sampleSize.toString()} />
        <StatRow label="Mean" value={formatNumber(stats.mean)} />
        <StatRow label="Median" value={formatNumber(stats.median)} />
        <StatRow label="Mode" value={stats.mode.map(formatNumber).join(', ') || 'N/A'} />
        <StatRow label="Std Dev" value={formatNumber(stats.stdDev)} />
        <StatRow label="Q1" value={formatNumber(stats.quartiles.q1)} />
        <StatRow label="Q3" value={formatNumber(stats.quartiles.q3)} />
        <StatRow label="Min" value={formatNumber(stats.min)} />
        <StatRow label="Max" value={formatNumber(stats.max)} />
        <StatRow label="Range" value={formatNumber(stats.max - stats.min)} />
        <StatRow label="IQR" value={formatNumber(stats.quartiles.q3 - stats.quartiles.q1)} />
        <StatRow label="Skewness" value={formatNumber(stats.skewness)} />
        <StatRow label="Kurtosis" value={formatNumber(stats.kurtosis)} />
      </div>
    </div>
  );
}