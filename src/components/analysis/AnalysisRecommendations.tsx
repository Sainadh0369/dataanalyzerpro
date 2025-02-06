import React from 'react';
import { Brain, AlertCircle } from 'lucide-react';
import { DataField } from '../../types';
import { getRecommendedAnalyses } from '../../utils/analysis/dataTypeInference';

interface AnalysisRecommendationsProps {
  fields: DataField[];
  onSelect: (analysisTypes: string[]) => void;
}

export default function AnalysisRecommendations({ fields, onSelect }: AnalysisRecommendationsProps) {
  const recommendations = getRecommendedAnalyses(fields);

  const handleApplyRecommendations = () => {
    onSelect(recommendations.map(r => r.type));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-indigo-600" />
        <h3 className="text-lg font-semibold">AI-Recommended Analyses</h3>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${
              rec.confidence === 'high' ? 'text-green-500' :
              rec.confidence === 'medium' ? 'text-yellow-500' :
              'text-gray-500'
            }`} />
            <div>
              <p className="font-medium text-gray-900">
                {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)} Analysis
              </p>
              <p className="text-sm text-gray-600">{rec.reason}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={handleApplyRecommendations}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Recommendations
        </button>
      </div>
    </div>
  );
}