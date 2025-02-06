import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { StrategyRecommendation } from '../../types/analysis';

interface StrategyCardProps {
  strategy: StrategyRecommendation;
}

export default function StrategyCard({ strategy }: StrategyCardProps) {
  const impactColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const timeframeColors = {
    short: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    long: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{strategy.title}</h3>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${impactColors[strategy.impact]}`}>
            {strategy.impact} impact
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${timeframeColors[strategy.timeframe]}`}>
            {strategy.timeframe} term
          </span>
        </div>
      </div>
      <p className="text-gray-600">{strategy.description}</p>
    </div>
  );
}