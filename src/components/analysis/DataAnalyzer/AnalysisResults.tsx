import React from 'react';
import { Brain } from 'lucide-react';
import { AnalyzedData } from '../../../types';

interface AnalysisResultsProps {
  analysis: AnalyzedData;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Analysis Results</h3>
      </div>

      <div className="space-y-6">
        <DataQuality quality={analysis.dataQuality} />
        {analysis.insights.length > 0 && <Insights insights={analysis.insights} />}
      </div>
    </div>
  );
}

function DataQuality({ quality }: { quality: AnalyzedData['dataQuality'] }) {
  return (
    <div>
      <h4 className="font-medium mb-3">Data Quality</h4>
      <div className="grid grid-cols-2 gap-4">
        <QualityMetric
          label="Completeness"
          value={quality.completeness}
          description="Percentage of non-null values"
        />
        <QualityMetric
          label="Validity"
          value={quality.validity}
          description="Percentage of valid values"
        />
      </div>
    </div>
  );
}

function QualityMetric({ 
  label, 
  value, 
  description 
}: { 
  label: string; 
  value: number; 
  description: string;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-lg font-semibold">{(value * 100).toFixed(1)}%</span>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

function Insights({ insights }: { insights: string[] }) {
  return (
    <div>
      <h4 className="font-medium mb-3">Key Insights</h4>
      <ul className="space-y-2">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-indigo-600 mt-1">•</span>
            <span className="text-gray-600">{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}