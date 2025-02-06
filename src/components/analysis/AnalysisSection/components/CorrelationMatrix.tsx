import React from 'react';
import { BarChart2 } from 'lucide-react';
import type { DataField } from '@types/data';
import { calculateCorrelations } from '@utils/analysis/statistics/correlation';
import { AnalysisHeader } from './AnalysisHeader';

interface CorrelationMatrixProps {
  fields: DataField[];
}

export function CorrelationMatrix({ fields }: CorrelationMatrixProps) {
  const numericFields = fields.filter(f => f.type === 'number');
  
  if (numericFields.length < 2) {
    return null;
  }

  const correlations = calculateCorrelations(numericFields);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <AnalysisHeader 
        title="Correlation Analysis" 
        icon={<BarChart2 className="w-5 h-5 text-indigo-600" />}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 bg-gray-50"></th>
              {numericFields.map(field => (
                <th key={field.name} className="px-4 py-2 bg-gray-50 font-medium text-gray-700">
                  {field.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numericFields.map((field1, i) => (
              <tr key={field1.name}>
                <th className="px-4 py-2 bg-gray-50 font-medium text-gray-700 text-left">
                  {field1.name}
                </th>
                {numericFields.map((field2, j) => {
                  const key = i <= j ? `${field2.name}_${field1.name}` : `${field1.name}_${field2.name}`;
                  const value = i === j ? 1 : correlations[key] || 0;
                  return (
                    <td 
                      key={`${field1.name}_${field2.name}`}
                      className="px-4 py-2 text-center"
                      style={{
                        backgroundColor: getCorrelationColor(value),
                        color: Math.abs(value) > 0.5 ? 'white' : 'black'
                      }}
                    >
                      {value.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Color intensity indicates correlation strength:</p>
        <ul className="mt-2 space-y-1">
          <li>• Dark blue: Strong positive correlation (close to 1)</li>
          <li>• White: No correlation (close to 0)</li>
          <li>• Dark red: Strong negative correlation (close to -1)</li>
        </ul>
      </div>
    </div>
  );
}

function getCorrelationColor(value: number): string {
  const absValue = Math.abs(value);
  if (value > 0) {
    return `rgba(59, 130, 246, ${absValue})`; // Blue
  } else if (value < 0) {
    return `rgba(239, 68, 68, ${absValue})`; // Red
  }
  return 'rgb(255, 255, 255)'; // White
}