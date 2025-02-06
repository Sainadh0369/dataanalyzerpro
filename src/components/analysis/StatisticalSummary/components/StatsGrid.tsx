import React from 'react';
import { DataField } from '../../../../types';
import { FieldStats } from './FieldStats';

interface StatsGridProps {
  fields: DataField[];
}

export function StatsGrid({ fields }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fields.map(field => (
        <FieldStats key={field.name} field={field} />
      ))}
    </div>
  );
}