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
import { DataField } from '../types';

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

interface DataVisualizationProps {
  data: DataField[];
}

export default function DataVisualization({ data }: DataVisualizationProps) {
  const numericFields = data.filter(field => field.type === 'number');
  
  const chartData = {
    labels: numericFields.map(field => field.name),
    datasets: [{
      label: 'Field Values',
      data: numericFields.map(field => {
        const values = field.value as number[];
        return values.length > 0 ? values[0] : 0;
      }),
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Data Overview',
      },
    },
  };

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Bar options={options} data={chartData} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}