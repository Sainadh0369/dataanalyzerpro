export interface ChartTheme {
  colors: {
    background: string[];
    border: string[];
    series: string[];
    seriesBackground: string[];
    points: string;
  };
}

const defaultTheme: ChartTheme = {
  colors: {
    background: [
      'rgba(99, 102, 241, 0.5)',
      'rgba(244, 63, 94, 0.5)',
      'rgba(34, 197, 94, 0.5)',
      'rgba(234, 179, 8, 0.5)',
      'rgba(168, 85, 247, 0.5)'
    ],
    border: [
      'rgb(99, 102, 241)',
      'rgb(244, 63, 94)',
      'rgb(34, 197, 94)',
      'rgb(234, 179, 8)',
      'rgb(168, 85, 247)'
    ],
    series: [
      'rgb(99, 102, 241)',
      'rgb(244, 63, 94)',
      'rgb(34, 197, 94)',
      'rgb(234, 179, 8)',
      'rgb(168, 85, 247)'
    ],
    seriesBackground: [
      'rgba(99, 102, 241, 0.1)',
      'rgba(244, 63, 94, 0.1)',
      'rgba(34, 197, 94, 0.1)',
      'rgba(234, 179, 8, 0.1)',
      'rgba(168, 85, 247, 0.1)'
    ],
    points: 'rgba(99, 102, 241, 0.5)'
  }
};

export function getChartTheme(): ChartTheme {
  return defaultTheme;
}