import type { TextAnalysisResult } from './types';

export function analyzeText(values: string[]): TextAnalysisResult {
  const cleanValues = values.filter(v => typeof v === 'string' && v.trim().length > 0);
  
  return {
    totalCount: cleanValues.length,
    uniqueCount: new Set(cleanValues).size,
    averageLength: cleanValues.length > 0
      ? cleanValues.reduce((sum, val) => sum + val.length, 0) / cleanValues.length
      : 0
  };
}

export function getUniqueValues(values: any[]): Set<any> {
  return new Set(values.filter(v => v != null && v !== ''));
}