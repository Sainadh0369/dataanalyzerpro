import React from 'react';
import { Brain, Loader } from 'lucide-react';

interface AnalysisProgressProps {
  progress: number;
  isAnalyzing: boolean;
}

export default function AnalysisProgress({ progress, isAnalyzing }: AnalysisProgressProps) {
  if (!isAnalyzing) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
        </div>
        <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
      </div>

      <div className="space-y-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Analyzing data...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}