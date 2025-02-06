import React from 'react';
import { DataField } from '../../../types';
import { Overview } from './Overview';
import { StatisticalAnalysis } from './StatisticalAnalysis';
import { RegressionAnalysis } from './RegressionAnalysis';
import { Visualizations } from './Visualizations';
import { AnalysisResults } from './AnalysisResults';
import { useAnalysis } from '../../../hooks/analysis';

interface DataAnalyzerProps {
  data: {
    fields: DataField[];
  };
}

export function DataAnalyzer({ data }: DataAnalyzerProps) {
  const { analysis, isLoading, error } = useAnalysis(data.fields);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Overview data={data} />
      <StatisticalAnalysis data={data} />
      <RegressionAnalysis data={data} />
      <Visualizations data={data} />
      {analysis && <AnalysisResults analysis={analysis} />}
    </div>
  );
}