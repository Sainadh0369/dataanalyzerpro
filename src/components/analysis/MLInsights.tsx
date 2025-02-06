import React from 'react';
import { Brain, TrendingUp } from 'lucide-react';

interface MLInsightsProps {
  predictions: Record<string, number[]>;
  confidence: number;
  features: string[];
}

export default function MLInsights({ predictions, confidence, features }: MLInsightsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-indigo-600" />
        <h3 className="text-lg font-semibold">Machine Learning Insights</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Model Confidence</span>
          <span className="font-semibold">{(confidence * 100).toFixed(1)}%</span>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Feature Importance</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="text-gray-600">{feature}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${100 - (index * 20)}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {Object.entries(predictions).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Predicted Trends
            </h4>
            <ul className="space-y-2">
              {Object.entries(predictions).map(([field, values]) => (
                <li key={field} className="flex items-center justify-between">
                  <span className="text-gray-600">{field}</span>
                  <span className="font-medium text-gray-900">
                    {values[values.length - 1] > values[0] ? '📈' : '📉'}
                    {' '}
                    {((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}