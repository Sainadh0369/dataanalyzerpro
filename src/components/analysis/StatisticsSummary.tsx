import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface StatisticsSummaryProps {
  statistics: {
    summary: Record<string, any>;
    correlations: Record<string, number>;
  };
}

export default function StatisticsSummary({ statistics }: StatisticsSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-indigo-600" />
        <h3 className="text-lg font-semibold">Statistical Summary</h3>
      </div>

      {/* Field Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(statistics.summary).map(([field, stats]) => (
          <div key={field} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">{field}</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-gray-600">Mean</dt>
              <dd className="text-gray-900">{stats.mean.toFixed(2)}</dd>
              <dt className="text-gray-600">Median</dt>
              <dd className="text-gray-900">{stats.median.toFixed(2)}</dd>
              <dt className="text-gray-600">Std Dev</dt>
              <dd className="text-gray-900">{stats.standardDeviation.toFixed(2)}</dd>
            </dl>
          </div>
        ))}
      </div>

      {/* Correlations */}
      {Object.keys(statistics.correlations).length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-indigo-600" />
            <h3 className="text-lg font-semibold">Correlations</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(statistics.correlations)
              .filter(([_, value]) => Math.abs(value) > 0.5)
              .map(([key, value]) => {
                const [field1, field2] = key.split('_');
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {field1} vs {field2}
                    </span>
                    <span className={`font-medium ${
                      value > 0.7 ? 'text-green-600' :
                      value < -0.7 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {value.toFixed(2)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}