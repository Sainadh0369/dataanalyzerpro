import React from 'react';
import { Brain, FileUp, BarChart2 } from 'lucide-react';
import { DataField } from '../../utils/core/types';
import { DataCard } from './cards/DataCard';
import DataVisualizer from './DataVisualizer';
import StatisticalSummary from './StatisticalSummary';
import RegressionAnalysis from './RegressionAnalysis';
import TextAnalysis from './TextAnalysis';
import InsightsPanel from './InsightsPanel';
import { generateInsights } from '../../utils/analysis/insights';

interface DataAnalyzerProps {
  data: {
    fields: DataField[];
  };
}

export default function DataAnalyzer({ data }: DataAnalyzerProps) {
  const numericFields = data.fields.filter(field => field.type === 'number');
  const textFields = data.fields.filter(field => field.type === 'string');
  const insights = generateInsights(data.fields);

  return (
    <div className="space-y-8">
      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DataCard
          icon={<FileUp className="w-5 h-5 text-indigo-600" />}
          title="Total Fields"
          value={data.fields.length}
        />
        <DataCard
          icon={<BarChart2 className="w-5 h-5 text-indigo-600" />}
          title="Numeric Fields"
          value={numericFields.length}
        />
        <DataCard
          icon={<Brain className="w-5 h-5 text-indigo-600" />}
          title="Text Fields"
          value={textFields.length}
        />
      </div>

      {/* Insights Panel */}
      <InsightsPanel analysis={insights} />

      {/* Data Visualizations */}
      {numericFields.length > 0 && (
        <DataVisualizer data={data} />
      )}

      {/* Statistical Analysis */}
      {numericFields.length > 0 && (
        <StatisticalSummary data={data} />
      )}

      {/* Regression Analysis */}
      {numericFields.length > 1 && (
        <RegressionAnalysis data={data} />
      )}

      {/* Text Analysis */}
      {textFields.length > 0 && (
        <TextAnalysis fields={textFields} />
      )}
    </div>
  );
}