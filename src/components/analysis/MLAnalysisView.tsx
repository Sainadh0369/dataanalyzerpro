import React from 'react';
import { Brain, TrendingUp, AlertCircle, LineChart } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { formatNumber } from '@/utils/analysis/formatting';

interface MLAnalysisViewProps {
  analysis: {
    field: string;
    predictions: number[];
    confidence: number;
    features: string[];
    patterns: {
      type: string;
      description: string;
      confidence: number;
    }[];
    metrics: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
    };
  }[];
}

export function MLAnalysisView({ analysis = [] }: MLAnalysisViewProps) {
  const [error, setError] = React.useState<string | null>(null);

  if (!analysis?.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle className="w-5 h-5" />
          <p>No machine learning analysis results available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {analysis.map((result, index) => (
        <div key={`${result.field}-${index}`} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold">{result.field}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Confidence:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${(result.confidence || 0) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {((result.confidence || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Predictions Chart */}
          <div className="h-64 mb-6">
            <Line
              data={{
                labels: Array.from({ length: result.predictions?.length || 0 }, (_, i) => `t+${i+1}`),
                datasets: [{
                  label: 'Predicted Values',
                  data: result.predictions || [],
                  borderColor: 'rgb(99, 102, 241)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'ML Predictions'
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

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Accuracy"
              value={formatNumber(result.metrics?.accuracy || 0)}
              icon={<Brain className="w-4 h-4" />}
            />
            <MetricCard
              title="Precision"
              value={formatNumber(result.metrics?.precision || 0)}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <MetricCard
              title="Recall"
              value={formatNumber(result.metrics?.recall || 0)}
              icon={<LineChart className="w-4 h-4" />}
            />
            <MetricCard
              title="F1 Score"
              value={formatNumber(result.metrics?.f1Score || 0)}
              icon={<Brain className="w-4 h-4" />}
            />
          </div>

          {/* Patterns */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Detected Patterns</h4>
            <div className="grid gap-4">
              {(result.patterns || []).map((pattern, i) => (
                <div
                  key={i}
                  className="bg-gray-50 p-4 rounded-lg flex items-start gap-3"
                >
                  <div className={`p-2 rounded-lg ${
                    (pattern.confidence || 0) > 0.7 ? 'bg-green-100 text-green-700' :
                    (pattern.confidence || 0) > 0.5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pattern.type}</p>
                    <p className="text-sm text-gray-600">{pattern.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                        <div
                          className="h-1.5 rounded-full bg-indigo-600"
                          style={{ width: `${(pattern.confidence || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {((pattern.confidence || 0) * 100).toFixed()}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Importance */}
          {(result.features || []).length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-4">Feature Importance</h4>
              <div className="space-y-3">
                {(result.features || []).map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 min-w-[120px]">{feature}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-indigo-600 rounded-full"
                        style={{ width: `${100 - (i * 20)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-indigo-600">{icon}</div>
        <h5 className="text-sm font-medium text-gray-600">{title}</h5>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}