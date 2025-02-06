import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { DataField } from '../../../types';
import { performRegression } from '../../../utils/analysis/regression';

interface RegressionAnalysisProps {
  data: {
    fields: DataField[];
  };
}

export function RegressionAnalysis({ data }: RegressionAnalysisProps) {
  const results = performRegression(data.fields);

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Regression Analysis</h3>
      </div>

      <div className="space-y-8">
        {results.map((result, index) => (
          <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
            <h4 className="font-medium text-gray-800 mb-2">{result.field}</h4>
            
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <code className="text-sm text-gray-700">{result.equation}</code>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">R² Score:</span>
              <div className="flex-1 max-w-xs">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${result.rSquared * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium">
                {(result.rSquared * 100).toFixed(1)}%
              </span>
            </div>

            <div className="h-64">
              <Line
                data={{
                  labels: Array.from({ length: result.predictions.length }, (_, i) => i + 1),
                  datasets: [{
                    label: 'Predictions',
                    data: result.predictions,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: `Predictions for ${result.field}`
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}