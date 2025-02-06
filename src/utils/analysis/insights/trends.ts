import { DataField } from '../../../types';

export function generateTrendInsights(fields: DataField[]): string[] {
  const insights: string[] = [];
  const numericFields = fields.filter(field => field.type === 'number');

  numericFields.forEach(field => {
    const values = field.value as number[];
    if (values.length < 2) return;

    const trend = analyzeTrend(values);
    if (trend) {
      insights.push(
        `${field.name} shows a ${trend.direction} trend with ${trend.confidence} confidence`
      );
    }
  });

  return insights;
}

function analyzeTrend(values: number[]): { 
  direction: 'increasing' | 'decreasing' | 'stable';
  confidence: 'high' | 'medium' | 'low';
} | null {
  const changes = values.slice(1).map((v, i) => v - values[i]);
  const positiveChanges = changes.filter(c => c > 0).length;
  const negativeChanges = changes.filter(c => c < 0).length;
  const total = changes.length;

  const ratio = Math.max(positiveChanges, negativeChanges) / total;

  if (ratio > 0.7) {
    return {
      direction: positiveChanges > negativeChanges ? 'increasing' : 'decreasing',
      confidence: 'high'
    };
  } else if (ratio > 0.6) {
    return {
      direction: positiveChanges > negativeChanges ? 'increasing' : 'decreasing',
      confidence: 'medium'
    };
  } else if (ratio > 0.5) {
    return {
      direction: positiveChanges > negativeChanges ? 'increasing' : 'decreasing',
      confidence: 'low'
    };
  }

  return {
    direction: 'stable',
    confidence: 'high'
  };
}