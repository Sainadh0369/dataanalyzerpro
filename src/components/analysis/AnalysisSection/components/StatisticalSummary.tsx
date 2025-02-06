import React from 'react';
import { Calculator } from 'lucide-react';
import type { DataField } from '@types/data';
import { FieldStats } from './FieldStats';
import { AnalysisHeader } from './AnalysisHeader';

interface StatisticalSummaryProps {
  data: {
    fields: DataField[];
  };
}

export function StatisticalSummary({ data }: StatisticalSummaryProps) {
  const numericFields = data.fields.filter(f => f.type === 'number');

  if (numericFields.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <AnalysisHeader 
        title="Statistical Analysis" 
        icon={<Calculator className="w-5 h-5 text-indigo-600" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {numericFields.map(field => (
          <FieldStats key={field.name} field={field} />
        ))}
      </div>
    </div>
  );
}