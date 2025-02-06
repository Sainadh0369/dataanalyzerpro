import { DataField } from '@/types/data';
export function calculateStatistics(fields: DataField[]) {
  const numericFields = fields.filter(field => field.type === 'number');
  
  const statistics = {
    mean: {} as Record<string, number>,
    median: {} as Record<string, number>,
    standardDeviation: {} as Record<string, number>,
    correlations: {} as Record<string, number>
  };

  // Calculate statistics for numeric fields
  numericFields.forEach(field => {
    const values = field.value as number[];
    if (values.length > 0) {
      statistics.mean[field.name] = calculateMean(values);
      statistics.median[field.name] = calculateMedian(values);
      statistics.standardDeviation[field.name] = calculateStandardDeviation(values);
    }
  });

  // Calculate correlations between numeric fields
  if (numericFields.length > 1) {
    for (let i = 0; i < numericFields.length; i++) {
      for (let j = i + 1; j < numericFields.length; j++) {
        const field1 = numericFields[i];
        const field2 = numericFields[j];
        const key = `${field1.name}_${field2.name}`;
        statistics.correlations[key] = calculateCorrelation(
          field1.value as number[],
          field2.value as number[]
        );
      }
    }
  }

  return statistics;
}


import { determineTrend } from './trends';

export function calculateDatasetStats(fields: DataField[]): {
  averageMean: number;
  overallVariance: number;
  trendStrength: number;
} {
  const numericFields = fields.filter(f => f.type === 'number');
  const values = numericFields.flatMap(f => f.value as number[]);
  
  const averageMean = calculateMean(values);
  const overallVariance = calculateVariance(values);
  const trendStrength = calculateTrendStrength(numericFields);
  
  return {
    averageMean,
    overallVariance,
    trendStrength
  };
}

export function calculateFieldStats(field: DataField) {
  const values = field.value as number[];
  const mean = calculateMean(values);
  const median = calculateMedian(values);
  const mode = calculateMode(values);
  const stdDev = calculateStandardDeviation(values, mean);
  const quartiles = calculateQuartiles(values);
  const { min, max } = calculateMinMax(values);
  const skewness = calculateSkewness(values, mean, stdDev);
  const kurtosis = calculateKurtosis(values, mean, stdDev);
  const trend = determineTrend(values);
  return {
    mean,
    median,
    mode,
    stdDev,
    quartiles,
    min,
    max,
    skewness,
    kurtosis,
    trend,
    sampleSize: values.length
  };
}

// Optimized statistical calculations with error handling
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  
  // Use Kahan summation for better numerical stability
  let sum = 0;
  let compensation = 0;
  
  for (const value of values) {
    const y = value - compensation;
    const t = sum + y;
    compensation = (t - sum) - y;
    sum = t;
  }
  
  return sum / values.length;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateMode(values: number[]): number[] {
  if (values.length === 0) return [];
  
  const counts = new Map<number, number>();
  values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  
  let maxCount = 0;
  const modes: number[] = [];
  
  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      modes.length = 0;
      modes.push(value);
    } else if (count === maxCount) {
      modes.push(value);
    }
  });
  
  return modes;
}

export function calculateStandardDeviation(values: number[], mean?: number): number {
  if (values.length === 0) return 0;
  const avg = mean ?? calculateMean(values);
  
  // Two-pass algorithm for improved numerical stability
  let sum = 0;
  let compensation = 0;
  
  for (const value of values) {
    const diff = value - avg;
    const sqDiff = diff * diff;
    const y = sqDiff - compensation;
    const t = sum + y;
    compensation = (t - sum) - y;
    sum = t;
  }
  
  return Math.sqrt(sum / values.length);
}

export function calculateVariance(values: number[], mean?: number): number {
  if (values.length === 0) return 0;
  const avg = mean ?? calculateMean(values);
  return values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
}

export function calculateQuartiles(values: number[]): { q1: number; q2: number; q3: number } {
  if (values.length === 0) return { q1: 0, q2: 0, q3: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const q2 = calculateMedian(sorted);
  
  const lowerHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const upperHalf = sorted.slice(Math.ceil(sorted.length / 2));
  
  return {
    q1: calculateMedian(lowerHalf),
    q2,
    q3: calculateMedian(upperHalf)
  };
}

export function calculateMinMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

export function calculateSkewness(values: number[], mean: number, stdDev: number): number {
  if (values.length === 0 || stdDev === 0) return 0;
  const n = values.length;
  // Single pass calculation
  let sum = 0;
  const buffer = new Float64Array(values);
  for (let i = 0; i < buffer.length; i++) {
    sum += Math.pow((buffer[i] - mean) / stdDev, 3);
  }
  return (n / ((n - 1) * (n - 2))) * sum;
}

export function calculateKurtosis(values: number[], mean: number, stdDev: number): number {
  if (values.length === 0 || stdDev === 0) return 0;
  const n = values.length;
  // Single pass calculation
  let sum = 0;
  const buffer = new Float64Array(values);
  for (let i = 0; i < buffer.length; i++) {
    sum += Math.pow((buffer[i] - mean) / stdDev, 4);
  }
  const fourthMoment = sum / n;
  return fourthMoment - 3; // Excess kurtosis
}

export function calculateTrendStrength(fields: DataField[]): number {
  const trends = fields.map(field => {
    const values = field.value as number[];
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstMean = calculateMean(firstHalf);
    const secondMean = calculateMean(secondHalf);
    
    return Math.abs((secondMean - firstMean) / firstMean);
  });

  return calculateMean(trends);
}

export function calculateCorrelation(x: number[], y: number[]): number {
  if (!x?.length || !y?.length) return 0;
  const n = Math.min(x.length, y.length);
  
  // Validate input data
  if (n < 2) return 0;
  
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const deltaX = x[i] - meanX;
    const deltaY = y[i] - meanY;
    numerator += deltaX * deltaY;
    denomX += deltaX * deltaX;
    denomY += deltaY * deltaY;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}