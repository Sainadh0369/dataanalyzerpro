import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import type { DataField } from '@types/data';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartViewProps {
  data: DataField[];
  type?: 'line' | 'bar';
  title?: string;
}

export function ChartView({ data, type = 'bar', title }: ChartViewProps) {
  const chartData = React.useMemo(() => {
    if (!data?.length) {
      return {
        labels: [],
        datasets: []
      };
    }

    const numericFields = data.filter(f => f.type === 'number');
    if (!numericFields.length) {
      return {
        labels: [],
        datasets: []
      };
    }

    switch (type) {
      case 'bar':
      case 'line':
        return {
          labels: numericFields.map(field => field.name),
          datasets: [{
            label: 'Values',
            data: numericFields.map(field => {
              const values = field.value as number[];
              return values && values.length > 0 ? 
                values.reduce((sum, val) => sum + val, 0) / values.length : 
                0;
            }),
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1,
            fill: type === 'line' ? false : true
          }]
        };

      case 'scatter':
        if (numericFields.length < 2) return { labels: [], datasets: [] };
        return {
          datasets: [{
            label: `${numericFields[0].name} vs ${numericFields[1].name}`,
            data: (numericFields[0].value as number[]).map((x, i) => ({
              x,
              y: (numericFields[1].value as number[])[i] || 0
            })),
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
          }]
        };

      default:
        return { labels: [], datasets: [] };
    }
  }, [data, type]);

  const options = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: !!title,
        text: title
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return ` ${value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          drawBorder: false
        },
        ticks: {
          padding: 8,
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          padding: 8,
          color: '#6b7280'
        },
        title: {
          display: type === 'scatter',
          text: type === 'scatter' ? data?.[0]?.name : undefined
        }
      }
    }
  }), [title, type, data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <div className="w-full h-full min-h-[300px] p-4 bg-white rounded-lg border border-gray-200">
      <ChartComponent options={options} data={chartData} />
    </div>
  );
}