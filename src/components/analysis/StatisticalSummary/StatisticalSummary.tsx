import React from 'react';
import { Calculator } from 'lucide-react';
import type { DataField } from '../../../types';
import { FieldStats, StatsSummary } from './components';
import { AnalysisHeader } from '../AnalysisSection/components';

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
      <AnalysisHeader title="Statistical Analysis" />

      <StatsSummary fields={numericFields} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {numericFields.map(field => (
          <FieldStats key={field.name} field={field} />
        ))}
      </div>
    </div>
  );
}