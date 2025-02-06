import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DataField } from '../../../types';
import { analyzeField } from '../../../utils/analysis/statistics/analysis';
import { formatNumber } from '../../../utils/analysis/statistics/formatting';
import { StatRow } from './StatRow';
import { calculateMode, calculateQuartiles } from '../../../utils/analysis/statistics/calculations';

interface FieldStatsProps {
  field: DataField;
}

export function FieldStats({ field }: FieldStatsProps) {
  const stats = analyzeField(field);
  const TrendIcon = getTrendIcon(stats.trend);
  const mode = calculateMode(field.value as number[]);
  const quartiles = calculateQuartiles(field.value as number[]);

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
        <StatRow label="Mode" value={mode.map(formatNumber).join(', ') || 'N/A'} />
        <StatRow label="Std Dev" value={formatNumber(stats.stdDev)} />
        <StatRow label="Q1" value={formatNumber(quartiles.q1)} />
        <StatRow label="Q3" value={formatNumber(quartiles.q3)} />
        <StatRow label="Min" value={formatNumber(stats.min)} />
        <StatRow label="Max" value={formatNumber(stats.max)} />
      </div>
    </div>
  );
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    default: return Minus;
  }
}

function getTrendColor(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return 'w-4 h-4 text-green-500';
    case 'down': return 'w-4 h-4 text-red-500';
    default: return 'w-4 h-4 text-gray-500';
  }
}

function getTrendLabel(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return 'Upward Trend';
    case 'down': return 'Downward Trend';
    default: return 'Stable Trend';
  }
}