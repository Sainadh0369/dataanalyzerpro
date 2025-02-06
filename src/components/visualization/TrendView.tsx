import React from 'react';
import { Line } from 'react-chartjs-2';
import { DataField } from '../../types';

interface TrendViewProps {
  data: DataField[];
  title?: string;
}

export default function TrendView({ data, title }: TrendViewProps) {
  const numericFields = data.filter(field => field.type === 'number');
  
  const chartData = {
    labels: Array.from({ length: Math.max(...numericFields.map(f => f.value.length)) }, (_, i) => i + 1),
    datasets: numericFields.map((field, index) => ({
      label: field.name,
      data: field.value as number[],
      borderColor: `hsl(${(index * 360) / numericFields.length}, 70%, 50%)`,
      backgroundColor: `hsla(${(index * 360) / numericFields.length}, 70%, 50%, 0.5)`,
      tension: 0.4,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title || 'Trend Analysis',
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
      <Line options={options} data={chartData} />
    </div>
  );
}