import React from 'react';
import { AnalyzedData } from '../../types';
import InsightList from './InsightList';
import StatisticsSummary from './StatisticsSummary';
import { ChartView } from '../visualization';
import MLInsights from './MLInsights';
import NLPInsights from './NLPInsights';
import { PredictiveInsights } from '../predictive';
import RegressionView from './RegressionView';
import TimeSeriesView from './TimeSeriesView';

interface DataAnalysisViewProps {
  analysis: AnalyzedData;
}

export default function DataAnalysisView({ analysis }: DataAnalysisViewProps) {
  const hasNumericFields = analysis.hasNumericData;
  const hasTextFields = analysis.hasTextData;

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Data Quality</h3>
          <p className="mt-1 text-2xl font-semibold">
            {(analysis.dataQuality.validity * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Completeness</h3>
          <p className="mt-1 text-2xl font-semibold">
            {(analysis.dataQuality.completeness * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Fields Analyzed</h3>
          <p className="mt-1 text-2xl font-semibold">{analysis.fields.length}</p>
        </div>
      </div>

      {/* Key Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <InsightList insights={analysis.insights} />
        </div>
      )}

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
      {hasNumericFields && analysis.statistics && (
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

      {/* Regression Analysis */}
      {analysis.regressionResults && analysis.regressionResults.length > 0 && (
        <RegressionView results={analysis.regressionResults} />
      )}

      {/* Time Series Analysis */}
      {analysis.timeSeriesResults && analysis.timeSeriesResults.length > 0 && (
        <TimeSeriesView results={analysis.timeSeriesResults} />
      )}

      {/* Predictive Insights */}
      {analysis.predictions && analysis.predictions.length > 0 && (
        <PredictiveInsights predictions={analysis.predictions} />
      )}
    </div>
  );
}