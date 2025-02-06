import { ChartData, ChartOptions } from 'chart.js';
import { DataField } from '../../types';
import { getChartTheme } from './themes';

export function createBarChartConfig(fields: DataField[]): { data: ChartData; options: ChartOptions } {
  const numericFields = fields.filter(field => field.type === 'number');
  const theme = getChartTheme();

  return {
    data: {
      labels: numericFields.map(field => field.name),
      datasets: [{
        label: 'Values',
        data: numericFields.map(field => {
          const values = field.value as number[];
          return values.length > 0 ? values[0] : 0;
        }),
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Data Overview'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
}

export function createLineChartConfig(fields: DataField[]): { data: ChartData; options: ChartOptions } {
  const numericFields = fields.filter(field => field.type === 'number');
  const theme = getChartTheme();

  return {
    data: {
      labels: Array.from({ length: Math.max(...numericFields.map(f => f.value.length)) }, (_, i) => i + 1),
      datasets: numericFields.map((field, index) => ({
        label: field.name,
        data: field.value as number[],
        borderColor: theme.colors.series[index % theme.colors.series.length],
        backgroundColor: theme.colors.seriesBackground[index % theme.colors.seriesBackground.length],
        tension: 0.4
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Trend Analysis'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
}

export function createScatterChartConfig(
  xField: DataField,
  yField: DataField
): { data: ChartData; options: ChartOptions } {
  const theme = getChartTheme();

  return {
    data: {
      datasets: [{
        label: `${xField.name} vs ${yField.name}`,
        data: (xField.value as number[]).map((x, i) => ({
          x,
          y: (yField.value as number[])[i]
        })),
        backgroundColor: theme.colors.points,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Correlation Analysis'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: xField.name
          }
        },
        y: {
          title: {
            display: true,
            text: yField.name
          }
        }
      }
    }
  };
}