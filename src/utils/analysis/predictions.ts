import { DataField } from '@/types/data';
import { calculateFieldStats } from './statistics/calculations';
import { determineTrend } from './statistics/trends';
import { createError } from '../core/error';

export async function generatePredictions(data: { fields: DataField[] }): Promise<any> {
  if (!data?.fields?.length) {
    throw createError('ANALYSIS_ERROR', 'No data available for predictions');
  }

  const numericFields = data.fields.filter(f => f.type === 'number');
  if (numericFields.length === 0) {
    throw createError('ANALYSIS_ERROR', 'No numeric fields available for predictions');
  }
  
  const predictions = await Promise.all(
    numericFields.map(async field => ({
      field: field.name,
      predictions: await predictValues(field),
      confidence: calculateConfidence(field),
      trend: determineTrend(field.value as number[]),
      metrics: calculateMetrics(field)
    }))
  );

  return predictions;
}

async function predictValues(field: DataField) {
  const values = field.value as number[];
  const horizon = 5; // Predict next 5 points
  const predictions = [];
  
  // Simple exponential smoothing
  const alpha = 0.3;
  let lastValue = values[values.length - 1];
  let lastTrend = values[values.length - 1] - values[values.length - 2];

  for (let i = 0; i < horizon; i++) {
    const nextValue = lastValue + lastTrend;
    predictions.push(nextValue);
    lastTrend = alpha * (nextValue - lastValue) + (1 - alpha) * lastTrend;
    lastValue = nextValue;
  }

  return predictions;
}

function calculateConfidence(field: DataField) {
  const stats = calculateFieldStats(field);
  const cv = stats.stdDev / stats.mean; // Coefficient of variation
  return Math.max(0, 1 - cv);
}

function calculateMetrics(field: DataField) {
  const values = field.value as number[];
  const stats = calculateFieldStats(field);
  
  return {
    accuracy: 1 - (stats.stdDev / stats.mean),
    stability: 1 - Math.abs((values[values.length - 1] - values[0]) / values[0]),
    trend: determineTrend(values)
  };
}