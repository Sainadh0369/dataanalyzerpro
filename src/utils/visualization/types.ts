import { ChartType } from 'chart.js';
import { DataField } from '../../types';

export interface ChartConfig {
  type: ChartType;
  data: DataField[];
  options?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
  };
}

export interface ChartDimensions {
  width: number;
  height: number;
}