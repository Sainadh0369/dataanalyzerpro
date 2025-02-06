import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type Trend = 'up' | 'down' | 'stable';

export function getTrendIcon(trend: Trend) {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    default: return Minus;
  }
}

export function getTrendColor(trend: Trend): string {
  switch (trend) {
    case 'up': return 'w-4 h-4 text-green-500';
    case 'down': return 'w-4 h-4 text-red-500';
    default: return 'w-4 h-4 text-gray-500';
  }
}

export function getTrendLabel(trend: Trend): string {
  switch (trend) {
    case 'up': return 'Upward Trend';
    case 'down': return 'Downward Trend';
    default: return 'Stable Trend';
  }
}