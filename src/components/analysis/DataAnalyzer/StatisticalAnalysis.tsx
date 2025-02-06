```typescript
import React from 'react';
import { Calculator } from 'lucide-react';
import { DataField } from '../../../types';
import { FieldStats } from './FieldStats';

interface StatisticalAnalysisProps {
  data: {
    fields: DataField[];
  };
}

export function StatisticalAnalysis({ data }: StatisticalAnalysisProps) {
  const numericFields = data.fields.filter(f => f.type === 'number');

  if (numericFields.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Statistical Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {numericFields.map(field => (
          <FieldStats key={field.name} field={field} />
        ))}
      </div>
    </div>
  );
}
```