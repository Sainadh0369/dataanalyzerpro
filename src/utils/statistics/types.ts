export type Trend = 'up' | 'down' | 'stable';

export interface FieldStatistics {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  sampleSize: number;
  trend: Trend;
}

export interface StatisticalAnalysis {
  fieldName: string;
  stats: FieldStatistics;
  trend: Trend;
  confidence: number;
}