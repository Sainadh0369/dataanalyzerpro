import React from 'react';
import { Brain } from 'lucide-react';
import { DataField } from '../../utils/core/types';
import { TextFieldCard } from './cards/TextFieldCard';

interface TextAnalysisProps {
  fields: DataField[];
}

export default function TextAnalysis({ fields }: TextAnalysisProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Text Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, index) => (
          <TextFieldCard key={`${field.name}-${index}`} field={field} />
        ))}
      </div>
    </div>
  );
}