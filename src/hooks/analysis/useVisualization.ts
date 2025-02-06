import { useState, useCallback } from 'react';
import { DataField } from '../../types';

export function useVisualization() {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const toggleField = useCallback((fieldName: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  }, []);

  const getFilteredData = useCallback((fields: DataField[]) => {
    return fields.filter(field => 
      selectedFields.length === 0 || selectedFields.includes(field.name)
    );
  }, [selectedFields]);

  return {
    selectedFields,
    chartType,
    setChartType,
    toggleField,
    getFilteredData,
  };
}