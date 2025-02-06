import React from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { ChartConfig, ChartDimensions } from '../../utils/visualization/types';
import { defaultChartOptions } from '../../utils/visualization/config';
import { createBarChartConfig, createLineChartConfig, createScatterChartConfig } from '../../utils/visualization/charts';

interface ChartContainerProps {
  config: ChartConfig;
  dimensions?: ChartDimensions;
  className?: string;
}

export default function ChartContainer({ config, dimensions, className }: ChartContainerProps) {
  const chartProps = {
    options: {
      ...defaultChartOptions,
      plugins: {
        ...defaultChartOptions.plugins,
        title: {
          display: !!config.options?.title,
          text: config.options?.title
        }
      }
    },
    width: dimensions?.width,
    height: dimensions?.height,
    className
  };

  switch (config.type) {
    case 'bar': {
      const { data, options } = createBarChartConfig(config.data);
      return <Bar {...chartProps} data={data} options={options} />;
    }
    case 'line': {
      const { data, options } = createLineChartConfig(config.data);
      return <Line {...chartProps} data={data} options={options} />;
    }
    case 'scatter': {
      if (config.data.length < 2) return null;
      const { data, options } = createScatterChartConfig(config.data[0], config.data[1]);
      return <Scatter {...chartProps} data={data} options={options} />;
    }
    default:
      return null;
  }
}