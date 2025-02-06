import React from 'react';
import { Brain, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { InsightsAnalysis } from '../../utils/analysis/insights';

interface InsightsPanelProps {
  analysis: InsightsAnalysis;
}

export default function InsightsPanel({ analysis }: InsightsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Key Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Key Insights</h3>
        </div>
        <ul className="space-y-2">
          {analysis.insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
              <span className="text-gray-700">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Recommendations</h3>
        </div>
        <ul className="space-y-2">
          {analysis.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Strengths */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Strengths</h3>
        </div>
        <ul className="space-y-2">
          {analysis.pros.map((pro, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-gray-700">{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold">Areas for Improvement</h3>
        </div>
        <ul className="space-y-2">
          {analysis.cons.map((con, index) => (
            <li key={index} className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
              <span className="text-gray-700">{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}