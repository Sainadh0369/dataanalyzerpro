import { DataField } from '../../types';

export function inferAnalysisTypes(fields: DataField[]) {
  const numericFields = fields.filter(f => f.type === 'number');
  const textFields = fields.filter(f => f.type === 'string');
  const dateFields = fields.filter(f => f.type === 'date');

  return {
    // Basic analysis always available if we have any data
    basicAnalysis: fields.length > 0,

    // Statistical analysis for numeric fields
    statisticalAnalysis: numericFields.length > 0,

    // ML analysis requires at least 2 numeric fields and sufficient data points
    mlAnalysis: numericFields.length >= 2 && 
      numericFields.every(f => f.value.length >= 10),

    // NLP analysis for text fields
    nlpAnalysis: textFields.length > 0,

    // Time series analysis for numeric fields with sufficient sequential data
    timeSeriesAnalysis: numericFields.length > 0 && 
      numericFields.some(f => f.value.length >= 30),

    // Regression analysis for multiple numeric fields
    regressionAnalysis: numericFields.length >= 2,

    // Predictive analysis for numeric fields with trends
    predictiveAnalysis: numericFields.length > 0 && 
      numericFields.some(f => f.value.length >= 20),

    // Clustering analysis for multiple numeric dimensions
    clusteringAnalysis: numericFields.length >= 2 && 
      numericFields.every(f => f.value.length >= 5),

    // Temporal analysis for date fields
    temporalAnalysis: dateFields.length > 0
  };
}

export function getRecommendedAnalyses(fields: DataField[]) {
  const types = inferAnalysisTypes(fields);
  const recommendations = [];

  if (types.statisticalAnalysis) {
    recommendations.push({
      type: 'statistical',
      confidence: 'high',
      reason: 'Numeric data available for statistical analysis'
    });
  }

  if (types.mlAnalysis) {
    recommendations.push({
      type: 'ml',
      confidence: 'medium',
      reason: 'Sufficient numeric data for machine learning analysis'
    });
  }

  if (types.timeSeriesAnalysis) {
    recommendations.push({
      type: 'timeSeries',
      confidence: 'high',
      reason: 'Sequential numeric data suitable for time series analysis'
    });
  }

  if (types.nlpAnalysis) {
    recommendations.push({
      type: 'nlp',
      confidence: 'medium',
      reason: 'Text data available for natural language processing'
    });
  }

  return recommendations;
}