import { ChartOptions } from 'chart.js';

export const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

export const chartColors = {
  primary: 'rgb(99, 102, 241)',
  secondary: 'rgb(244, 63, 94)',
  accent: 'rgb(34, 197, 94)',
  background: 'rgba(99, 102, 241, 0.1)'
};