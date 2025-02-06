import React from 'react';
import { DataField } from '../../../utils/core/types';
import { getUniqueValues } from '../../../utils/analysis/textAnalysis';

interface TextFieldCardProps {
  field: DataField;
}

export function TextFieldCard({ field }: TextFieldCardProps) {
  const uniqueValues = getUniqueValues(field.value);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">{field.name}</h4>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Sample Size: {field.value.length} entries
        </p>
        <p className="text-sm text-gray-600">
          Unique Values: {uniqueValues.size}
        </p>
      </div>
    </div>
  );
}