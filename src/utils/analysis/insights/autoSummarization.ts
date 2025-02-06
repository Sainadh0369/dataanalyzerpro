import { DataField } from '@/types/data';
import { calculateFieldStats } from '../statistics/calculations';
import { determineTrend } from '../statistics/trends';
import { formatNumber } from '../statistics/formatting';

interface AutoSummary {
  overview: string[];
  keyTrends: {
    field: string;
    trend: string;
    changePercent: number;
    significance: 'high' | 'medium' | 'low';
  }[];
  anomalies: {
    field: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }[];
  recommendations: {
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }[];
}

export function generateAutoSummary(fields: DataField[]): AutoSummary {
  const numericFields = fields.filter(f => f.type === 'number');
  const textFields = fields.filter(f => f.type === 'string');

  // Generate overview
  const overview = [
    `Dataset contains ${fields.length} fields (${numericFields.length} numeric, ${textFields.length} text)`,
    `Total records: ${fields[0]?.value.length || 0}`
  ];

  // Analyze trends
  const trends = numericFields.map(field => {
    const values = field.value as number[];
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const changePercent = ((secondMean - firstMean) / firstMean) * 100;

    return {
      field: field.name,
      trend: determineTrend(values),
      changePercent,
      significance: Math.abs(changePercent) > 20 ? 'high' :
                   Math.abs(changePercent) > 10 ? 'medium' : 'low'
    };
  });

  // Detect anomalies
  const anomalies = numericFields.flatMap(field => {
    const stats = calculateFieldStats(field);
    const values = field.value as number[];
    const outliers = values.filter(v => 
      Math.abs(v - stats.mean) > 2 * stats.stdDev
    );

    if (outliers.length === 0) return [];

    return [{
      field: field.name,
      description: `${outliers.length} unusual values detected (${
        ((outliers.length / values.length) * 100).toFixed(1)
      }% of data)`,
      severity: outliers.length > values.length * 0.1 ? 'high' :
                outliers.length > values.length * 0.05 ? 'medium' : 'low'
    }];
  });

  // Generate recommendations
  const recommendations = generateRecommendations(trends, anomalies);

  return {
    overview,
    keyTrends: trends,
    anomalies,
    recommendations
  };
}

function generateRecommendations(
  trends: AutoSummary['keyTrends'],
  anomalies: AutoSummary['anomalies']
): AutoSummary['recommendations'] {
  const recommendations: AutoSummary['recommendations'] = [];

  // Recommendations based on trends
  trends
    .filter(t => t.significance === 'high')
    .forEach(trend => {
      if (trend.trend === 'down') {
        recommendations.push({
          action: `Investigate decline in ${trend.field}`,
          reason: `Significant decrease of ${Math.abs(trend.changePercent).toFixed(1)}%`,
          priority: 'high',
          impact: 'Direct impact on performance metrics'
        });
      } else if (trend.trend === 'up') {
        recommendations.push({
          action: `Capitalize on growth in ${trend.field}`,
          reason: `Strong increase of ${trend.changePercent.toFixed(1)}%`,
          priority: 'medium',
          impact: 'Opportunity for expansion'
        });
      }
    });

  // Recommendations based on anomalies
  anomalies
    .filter(a => a.severity === 'high')
    .forEach(anomaly => {
      recommendations.push({
        action: `Review anomalies in ${anomaly.field}`,
        reason: anomaly.description,
        priority: 'high',
        impact: 'Data quality and reliability'
      });
    });

  return recommendations;
}

export function formatAutoSummary(summary: AutoSummary): string {
  const sections = [
    '📊 Overview',
    ...summary.overview,
    '',
    '📈 Key Trends',
    ...summary.keyTrends.map(trend => 
      `${trend.field}: ${trend.trend === 'up' ? '⬆️' : trend.trend === 'down' ? '⬇️' : '➡️'} ${
        Math.abs(trend.changePercent).toFixed(1)
      }% ${trend.trend === 'up' ? 'increase' : trend.trend === 'down' ? 'decrease' : 'change'}`
    ),
    '',
    '⚠️ Anomalies',
    ...summary.anomalies.map(anomaly =>
      `${anomaly.field}: ${anomaly.description}`
    ),
    '',
    '🎯 Recommended Actions',
    ...summary.recommendations.map(rec =>
      `Priority ${rec.priority.toUpperCase()}: ${rec.action}\n` +
      `  Reason: ${rec.reason}\n` +
      `  Impact: ${rec.impact}`
    )
  ];

  return sections.join('\n');
}