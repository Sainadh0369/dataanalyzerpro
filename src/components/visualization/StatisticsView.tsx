import React from 'react';
import { Bar } from 'react-chartjs-2';
import { DataField } from '../../types';

interface StatisticsViewProps {
  data: DataField[];
  title?: string;
}

export default function StatisticsView({ data, title }: StatisticsViewProps) {
  const numericFields = data.filter(field => field.type === 'number');
  
  const statistics = numericFields.map(field => {
    const values = field.value as number[];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    );
    
    return {
      field: field.name,
      mean,
      stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  const chartData = {
    labels: statistics.map(stat => stat.field),
    datasets: [
      {
        label: 'Mean',
        data: statistics.map(stat => stat.mean),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
      {
        label: 'Standard Deviation',
        data: statistics.map(stat => stat.stdDev),
        backgroundColor: 'rgba(244, 63, 94, 0.5)',
        borderColor: 'rgb(244, 63, 94)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title || 'Statistical Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Bar options={options} data={chartData} />
    </div>
  );
}