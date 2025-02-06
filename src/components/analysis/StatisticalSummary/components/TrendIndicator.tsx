import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TrendIndicatorProps } from '../types';
import { getTrendIcon, getTrendColor, getTrendLabel } from '../utils/trends';

export function TrendIndicator({ trend, className = '' }: TrendIndicatorProps) {
  const Icon = getTrendIcon(trend);
  
  return (
    <div className="flex items-center gap-2">
      <Icon className={`${getTrendColor(trend)} ${className}`} />
      <span className="text-sm text-gray-600">
        {getTrendLabel(trend)}
      </span>
    </div>
  );
}