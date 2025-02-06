import type { ChartType, ChartData, ChartOptions } from 'chart.js';

export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
}

export interface ChartDimensions {
  width?: number;
  height?: number;
}