import React from 'react';
import { AnalyzedData } from '../types';
import InsightList from './analysis/InsightList';
import StatisticsSummary from './analysis/StatisticsSummary';
import { ChartView } from './visualization';
import MLInsights from './analysis/MLInsights';
import NLPInsights from './analysis/NLPInsights';
import { PredictiveInsights } from './predictive';

interface DataAnalysisViewProps {
  analysis: AnalyzedData;
}

export default function DataAnalysisView({ analysis }: DataAnalysisViewProps) {
  const hasNumericFields = analysis.fields.some(field => field.type === 'number');
  const hasTextFields = analysis.fields.some(field => field.type === 'string');

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Fields</h3>
          <p className="mt-1 text-2xl font-semibold">{analysis.fields.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Numeric Fields</h3>
          <p className="mt-1 text-2xl font-semibold">
            {analysis.fields.filter(f => f.type === 'number').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Text Fields</h3>
          <p className="mt-1 text-2xl font-semibold">
            {analysis.fields.filter(f => f.type === 'string').length}
          </p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <InsightList insights={analysis.insights} />
      </div>

      {/* Data Visualization */}
      {hasNumericFields && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Data Visualization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartView data={analysis.fields} type="bar" title="Overview" />
            <ChartView data={analysis.fields} type="line" title="Trends" />
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {hasNumericFields && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <StatisticsSummary statistics={analysis.statistics} />
        </div>
      )}

      {/* ML Insights */}
      {analysis.mlAnalysis && (
        <MLInsights 
          predictions={analysis.mlAnalysis.predictions}
          confidence={analysis.mlAnalysis.confidence}
          features={analysis.mlAnalysis.features}
        />
      )}

      {/* NLP Insights */}
      {hasTextFields && analysis.nlpResults && analysis.nlpResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysis.nlpResults.map((result, index) => (
            <NLPInsights key={index} {...result.analysis} />
          ))}
        </div>
      )}

      {/* Predictive Insights */}
      {analysis.predictions && analysis.predictions.length > 0 && (
        <PredictiveInsights predictions={analysis.predictions} />
      )}
    </div>
  );
}