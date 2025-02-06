import React from 'react';
import { Brain, TrendingUp, MessageSquare, Lightbulb } from 'lucide-react';

interface AIInsightsViewProps {
  insights: {
    insights: string[];
    recommendations: string[];
    patterns: string[];
  };
}

export default function AIInsightsView({ insights }: AIInsightsViewProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
      </div>

      <div className="space-y-8">
        {/* Key Insights */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-medium">Key Insights</h3>
          </div>
          <ul className="space-y-2">
            {insights.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Patterns */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-medium">Identified Patterns</h3>
          </div>
          <ul className="space-y-2">
            {insights.patterns.map((pattern, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">{pattern}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium">AI Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}