import React from 'react';
import { TimeSeriesResult } from '../../utils/analysis/timeSeries';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TimeSeriesViewProps {
  results: TimeSeriesResult[];
}

export default function TimeSeriesView({ results }: TimeSeriesViewProps) {
  if (!results.length) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-indigo-600" />
        <h3 className="text-lg font-semibold">Time Series Analysis</h3>
      </div>

      <div className="space-y-8">
        {results.map((result, index) => (
          <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">{result.field}</h4>
              <div className="flex items-center gap-2">
                {result.trend === 'increasing' ? (
                  <TrendingUp className="text-green-500 w-4 h-4" />
                ) : result.trend === 'decreasing' ? (
                  <TrendingDown className="text-red-500 w-4 h-4" />
                ) : (
                  <Minus className="text-gray-500 w-4 h-4" />
                )}
                <span className={`text-sm font-medium ${
                  result.trend === 'increasing' ? 'text-green-600' :
                  result.trend === 'decreasing' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {result.trend}
                </span>
              </div>
            </div>

            {/* Seasonality */}
            {result.seasonality && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">
                  Detected seasonality: {result.seasonality} periods
                </span>
              </div>
            )}

            {/* Model Confidence */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Model Confidence:</span>
              <div className="flex-1 max-w-xs">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>

            {/* Components Chart */}
            <div className="h-64 mb-6">
              <Line
                data={{
                  labels: Array.from(
                    { length: result.components.trend.length },
                    (_, i) => i + 1
                  ),
                  datasets: [
                    {
                      label: 'Trend',
                      data: result.components.trend,
                      borderColor: 'rgb(99, 102, 241)',
                      backgroundColor: 'transparent',
                      borderWidth: 2,
                    },
                    {
                      label: 'Seasonal',
                      data: result.components.seasonal,
                      borderColor: 'rgb(244, 63, 94)',
                      backgroundColor: 'transparent',
                      borderWidth: 2,
                    },
                    {
                      label: 'Residual',
                      data: result.components.residual,
                      borderColor: 'rgb(234, 179, 8)',
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderDash: [5, 5],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Time Series Components',
                    },
                  },
                }}
              />
            </div>

            {/* Forecast Chart */}
            <div className="h-64">
              <Line
                data={{
                  labels: Array.from(
                    { length: result.forecast.length },
                    (_, i) => `t+${i + 1}`
                  ),
                  datasets: [{
                    label: 'Forecast',
                    data: result.forecast,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Forecast',
                    },
                  },
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}