import React, { useState, useEffect } from 'react';
import { BarChart2, Brain } from 'lucide-react';
import type { DataField } from '@types/data';
import { AnalysisOverview } from './components/AnalysisOverview';
import { StatisticalSummary } from './components/StatisticalSummary';
import { CorrelationMatrix } from './components/CorrelationMatrix';
import { ChartView } from '@components/visualization';
import { useAnalysis } from '@hooks/analysis/useAnalysis';
import { AnalysisHeader, LoadingSpinner, ErrorMessage, ProgressBar } from './components';

interface AnalysisSectionProps {
  data: {
    fields: DataField[];
  };
}

export function AnalysisSection({ data }: AnalysisSectionProps) {
  const { analyze, isAnalyzing, error, results, progress } = useAnalysis();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      analyze(data.fields);
      setInitialized(true);
    }
  }, [analyze, data.fields, initialized]);

  if (error) {
    return <ErrorMessage message={error.message} />;
  }
  
  if (isAnalyzing) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold">Analyzing Data</h3>
        </div>
        <ProgressBar progress={progress} />
      </div>
    );
  }
  
  const numericFields = data.fields.filter(f => f.type === 'number');

  return (
    <div className="space-y-8">
      <AnalysisOverview data={data} />

      {numericFields.length > 0 && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <AnalysisHeader 
              title="Data Visualization" 
              icon={<BarChart2 className="w-5 h-5 text-indigo-600" />} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartView data={data.fields} type="bar" title="Overview" />
              <ChartView data={data.fields} type="line" title="Trends" />
            </div>
          </div>

          <CorrelationMatrix fields={data.fields} />
          <StatisticalSummary data={data} />
        </div>
      )}
    </div>
  );
}