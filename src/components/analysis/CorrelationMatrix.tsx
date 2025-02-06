import React from 'react';
import { BarChart2, Info } from 'lucide-react';
import type { DataField } from '@types/data';
import { calculateCorrelation } from '@/utils/analysis/statistics/calculations';

interface CorrelationMatrixProps {
  fields: DataField[];
}

interface CellProps {
  value: number;
  field1: string;
  field2: string;
}

function CorrelationCell({ value, field1, field2 }: CellProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  const interpretCorrelation = (value: number): string => {
    const strength = Math.abs(value);
    const direction = value > 0 ? 'positive' : 'negative';
    if (strength > 0.7) return `Strong ${direction}`;
    if (strength > 0.5) return `Moderate ${direction}`;
    if (strength > 0.3) return `Weak ${direction}`;
    return 'Very weak';
  };

  return (
    <td 
      className="relative px-4 py-2 text-center transition-all hover:scale-105 group"
      style={{
        backgroundColor: getCorrelationColor(value),
        color: Math.abs(value) > 0.5 ? 'white' : 'black',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {value.toFixed(2)}
      {showTooltip && (
        <div className="absolute z-10 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200 -translate-x-1/2 left-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="font-medium text-gray-900 mb-1">{field1} vs {field2}</p>
          <p className="text-sm text-gray-600">{interpretCorrelation(value)} correlation</p>
          <p className="text-xs text-gray-500 mt-1">
            {Math.abs(value * 100).toFixed(1)}% {value > 0 ? 'aligned' : 'inverse'} relationship
          </p>
        </div>
      )}
    </td>
  );
};

export function CorrelationMatrix({ fields }: CorrelationMatrixProps) {
  const numericFields = fields.filter(f => f.type === 'number');
  
  if (numericFields.length < 2) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center gap-2 text-gray-500 p-8 bg-gray-50 rounded-lg">
          <Info className="w-5 h-5" />
          <p>At least 2 numeric fields are required for correlation analysis</p>
        </div>
      </div>
    );
  }

  const correlations = React.useMemo(() => {
    const matrix: Record<string, number> = {};
    
    for (let i = 0; i < numericFields.length; i++) {
      const field1 = numericFields[i];
      for (let j = 0; j < numericFields.length; j++) { 
        const field2 = numericFields[j];
        const key = `${field1.name}_${field2.name}`;

        if (i === j) {
          matrix[key] = 1;
        } else {
          matrix[key] = calculateCorrelation(
            field1.value as number[],
            field2.value as number[]
          );
        }
      }
    }
    
    return matrix;
  }, [numericFields]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Correlation Analysis</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 bg-gray-50"></th>
              {numericFields.map(field => (
                <th key={field.name} className="px-4 py-2 bg-gray-50 font-medium text-gray-700">
                  <div className="transform -rotate-45 origin-left translate-y-6 whitespace-nowrap">
                    {field.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numericFields.map((field1) => (
              <tr key={field1.name}>
                <th className="px-4 py-2 bg-gray-50 font-medium text-gray-700 text-left">
                  {field1.name}
                </th>
                {numericFields.map((field2) => {
                  const key = `${field1.name}_${field2.name}`;
                  const value = correlations[key];
                  return <CorrelationCell 
                    key={key}
                    value={value}
                    field1={field1.name}
                    field2={field2.name}
                  />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Color intensity indicates correlation strength:</p>
        <ul className="mt-2 space-y-1">
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 1)' }} />
            <span>Strong positive correlation (close to 1)</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-gray-200" />
            <span>No correlation (close to 0)</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 1)' }} />
            <span>Strong negative correlation (close to -1)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function getCorrelationColor(value: number): string {
  const absValue = Math.abs(value);
  if (value > 0) {
    return `rgba(59, 130, 246, ${absValue * 0.8})`; // Blue with 80% max opacity
  } else if (value < 0) {
    return `rgba(239, 68, 68, ${absValue * 0.8})`; // Red with 80% max opacity
  }
  return 'rgb(255, 255, 255)'; // White
}