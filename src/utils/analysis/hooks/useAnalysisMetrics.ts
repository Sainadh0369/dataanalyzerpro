import { useMemo } from 'react';
import type { DataField } from '@types/data';

export function useAnalysisMetrics(fields: DataField[]) {
  return useMemo(() => {
    const numericFields = fields.filter(f => f.type === 'number');
    const textFields = fields.filter(f => f.type === 'string');
    const dateFields = fields.filter(f => f.type === 'date');

    const totalValues = fields.reduce((sum, field) => sum + field.value.length, 0);
    const nonNullValues = fields.reduce((sum, field) => 
      sum + field.value.filter(v => v != null && v !== '').length, 0);

    return {
      fieldCounts: {
        total: fields.length,
        numeric: numericFields.length,
        text: textFields.length,
        date: dateFields.length
      },
      dataQuality: {
        completeness: totalValues > 0 ? nonNullValues / totalValues : 0,
        uniqueness: calculateUniqueness(fields),
        consistency: calculateConsistency(fields)
      },
      sampleSize: fields[0]?.value.length || 0
    };
  }, [fields]);
}

function calculateUniqueness(fields: DataField[]): number {
  const uniquenessScores = fields.map(field => {
    const totalValues = field.value.length;
    const uniqueValues = new Set(field.value).size;
    return uniqueValues / totalValues;
  });

  return uniquenessScores.reduce((a, b) => a + b, 0) / fields.length;
}

function calculateConsistency(fields: DataField[]): number {
  return fields.reduce((acc, field) => {
    const validValues = field.value.filter(v => {
      if (field.type === 'number') return typeof v === 'number' && !isNaN(v);
      if (field.type === 'string') return typeof v === 'string' && v.trim() !== '';
      return v != null;
    }).length;
    return acc + (validValues / field.value.length);
  }, 0) / fields.length;
}