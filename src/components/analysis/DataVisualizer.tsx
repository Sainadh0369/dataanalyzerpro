import React, { useState } from 'react';
import { BarChart2, TrendingUp, PieChart } from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizerProps {
  data: {
    fields: Array<{
      name: string;
      type: string;
      value: any[];
    }>;
  };
}

export default function DataVisualizer({ data }: DataVisualizerProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const numericFields = data.fields.filter(field => field.type === 'number');
  
  const toggleField = (fieldName: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldName) 
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const fieldsToShow = selectedFields.length > 0
    ? numericFields.filter(f => selectedFields.includes(f.name))
    : numericFields;

  const chartData = {
    labels: fieldsToShow[0]?.value.map((_, i) => `Point ${i + 1}`) || [],
    datasets: fieldsToShow.map((field, index) => ({
      label: field.name,
      data: field.value,
      backgroundColor: `hsla(${index * 360 / fieldsToShow.length}, 70%, 50%, 0.2)`,
      borderColor: `hsl(${index * 360 / fieldsToShow.length}, 70%, 50%)`,
      borderWidth: 2,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Data Visualization',
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Field Selection */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-4">Select Fields to Visualize</h3>
        <div className="flex flex-wrap gap-2">
          {numericFields.map(field => (
            <button
              key={field.name}
              onClick={() => toggleField(field.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFields.includes(field.name) || selectedFields.length === 0
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {field.name}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Line Chart"
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
        >
          <Line data={chartData} options={options} />
        </ChartCard>

        <ChartCard
          title="Bar Chart"
          icon={<BarChart2 className="w-5 h-5 text-indigo-600" />}
        >
          <Bar data={chartData} options={options} />
        </ChartCard>
      </div>

      {/* Distribution */}
      <ChartCard
        title="Distribution"
        icon={<PieChart className="w-5 h-5 text-indigo-600" />}
      >
        <div className="max-w-md mx-auto">
          <Pie 
            data={{
              labels: fieldsToShow.map(f => f.name),
              datasets: [{
                data: fieldsToShow.map(f => 
                  f.value.reduce((a, b) => a + b, 0) / f.value.length
                ),
                backgroundColor: fieldsToShow.map((_, i) => 
                  `hsla(${i * 360 / fieldsToShow.length}, 70%, 50%, 0.2)`
                ),
                borderColor: fieldsToShow.map((_, i) => 
                  `hsl(${i * 360 / fieldsToShow.length}, 70%, 50%)`
                ),
              }]
            }}
            options={options}
          />
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ 
  children, 
  title, 
  icon 
}: { 
  children: React.ReactNode; 
  title: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}