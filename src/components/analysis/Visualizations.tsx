import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import { DataField } from '../../types';
import { Line, Bar } from 'react-chartjs-2';
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

interface VisualizationsProps {
  data: {
    fields: DataField[];
  };
}

export function Visualizations({ data }: VisualizationsProps) {
  const numericFields = data.fields.filter(f => f.type === 'number');

  if (numericFields.length === 0) {
    return null;
  }

  const chartData = {
    labels: numericFields.map(field => field.name),
    datasets: [{
      label: 'Values',
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
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Data Visualization</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[300px]">
          <Bar data={chartData} options={options} />
        </div>
        <div className="h-[300px]">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}