import { useState, useEffect } from 'react';
import { DataField, AnalyzedData } from '../types';
import { processData } from '../utils/analysis/data/processing';

export function useAnalysis(fields: DataField[]) {
  const [analysis, setAnalysis] = useState<AnalyzedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function analyzeData() {
      try {
        setIsLoading(true);
        setError(null);

        // Process and validate data
        const processedFields = processData(fields);

        // Basic analysis
        const numericFields = processedFields.filter(f => f.type === 'number');
        const textFields = processedFields.filter(f => f.type === 'string');

        setAnalysis({
          fields: processedFields,
          statistics: {
            mean: {},
            median: {},
            standardDeviation: {},
            correlations: {}
          },
          insights: [],
          hasNumericData: numericFields.length > 0,
          hasTextData: textFields.length > 0,
          dataQuality: {
            completeness: calculateCompleteness(processedFields),
            validity: calculateValidity(processedFields)
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Analysis failed'));
      } finally {
        setIsLoading(false);
      }
    }

    analyzeData();
  }, [fields]);

  return { analysis, isLoading, error };
}

function calculateCompleteness(fields: DataField[]): number {
  let totalValues = 0;
  let nonNullValues = 0;

  fields.forEach(field => {
    totalValues += field.value.length;
    nonNullValues += field.value.filter(v => v != null && v !== '').length;
  });

  return totalValues > 0 ? nonNullValues / totalValues : 0;
}

function calculateValidity(fields: DataField[]): number {
  let totalValues = 0;
  let validValues = 0;

  fields.forEach(field => {
    totalValues += field.value.length;
    validValues += field.value.filter(v => {
      if (field.type === 'number') return typeof v === 'number' && !isNaN(v);
      if (field.type === 'string') return typeof v === 'string' && v.trim() !== '';
      return v != null;
    }).length;
  });

  return totalValues > 0 ? validValues / totalValues : 0;
}