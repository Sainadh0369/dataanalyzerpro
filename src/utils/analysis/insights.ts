import { DataField } from '@/types/data';
import { calculateFieldStats } from './statistics/calculations';
import { determineTrend } from './statistics/trends';
import { formatNumber } from './formatting';
import { createError } from '../core/error';

export function generateAutoInsights(data: { fields: DataField[] }): any {
  if (!data?.fields?.length) {
    throw createError('ANALYSIS_ERROR', 'No data available for insights generation');
  }

  return {
    overview: generateOverview(data.fields),
    keyTrends: identifyTrends(data.fields),
    anomalies: detectAnomalies(data.fields),
    correlations: findCorrelations(data.fields),
    recommendations: generateRecommendations(data.fields)
  };
}

function generateOverview(fields: DataField[]) {
  const numericFields = fields.filter(f => f.type === 'number');
  const textFields = fields.filter(f => f.type === 'string');

  return {
    totalFields: fields.length,
    numericFields: numericFields.length,
    textFields: textFields.length,
    recordCount: fields[0]?.value.length || 0
  };
}

function identifyTrends(fields: DataField[]) {
  return fields
    .filter(f => f.type === 'number')
    .map(field => {
      const values = field.value as number[];
      const stats = calculateFieldStats(field);
      const trend = determineTrend(values);
      const changePercent = ((values[values.length - 1] - values[0]) / values[0]) * 100;

      return {
        field: field.name,
        trend,
        changePercent,
        significance: Math.abs(changePercent) > 20 ? 'high' :
                     Math.abs(changePercent) > 10 ? 'medium' : 'low'
      };
    });
}

function detectAnomalies(fields: DataField[]) {
  return fields
    .filter(f => f.type === 'number')
    .flatMap(field => {
      const values = field.value as number[];
      const stats = calculateFieldStats(field);
      const anomalies = values.filter(v => 
        Math.abs(v - stats.mean) > 2 * stats.stdDev
      );

      if (anomalies.length === 0) return [];

      return [{
        field: field.name,
        description: `${anomalies.length} unusual values detected`,
        severity: anomalies.length > values.length * 0.1 ? 'high' :
                 anomalies.length > values.length * 0.05 ? 'medium' : 'low'
      }];
    });
}

function findCorrelations(fields: DataField[]) {
  const numericFields = fields.filter(f => f.type === 'number');
  const correlations = [];

  for (let i = 0; i < numericFields.length; i++) {
    for (let j = i + 1; j < numericFields.length; j++) {
      const correlation = calculateCorrelation(
        numericFields[i].value as number[],
        numericFields[j].value as number[]
      );

      if (Math.abs(correlation) > 0.5) {
        correlations.push({
          fields: [numericFields[i].name, numericFields[j].name],
          correlation,
          strength: Math.abs(correlation) > 0.8 ? 'strong' :
                   Math.abs(correlation) > 0.6 ? 'moderate' : 'weak'
        });
      }
    }
  }

  return correlations;
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  return numerator / Math.sqrt(denomX * denomY);
}

function generateRecommendations(fields: DataField[]) {
  const recommendations = [];

  // Analyze trends
  fields
    .filter(f => f.type === 'number')
    .forEach(field => {
      const trend = determineTrend(field.value as number[]);
      if (trend === 'down') {
        recommendations.push({
          action: `Investigate decline in ${field.name}`,
          reason: 'Significant downward trend detected',
          priority: 'high',
          impact: 'Direct impact on performance metrics'
        });
      }
    });

  // Analyze data quality
  fields.forEach(field => {
    const nullCount = field.value.filter(v => v == null || v === '').length;
    if (nullCount > 0) {
      recommendations.push({
        action: `Improve data completeness for ${field.name}`,
        reason: `${nullCount} missing values detected`,
        priority: nullCount > field.value.length * 0.1 ? 'high' : 'medium',
        impact: 'Data quality and reliability'
      });
    }
  });

  return recommendations;
}