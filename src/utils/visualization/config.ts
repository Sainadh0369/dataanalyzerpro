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
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  }
};

export const chartSizes = {
  small: {
    width: 400,
    height: 300
  },
  medium: {
    width: 600,
    height: 400
  },
  large: {
    width: 800,
    height: 500
  }
};