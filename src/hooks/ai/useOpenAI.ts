import { useState, useCallback } from 'react';
import { DataField } from '../../types';
import { analyzeDataWithAI } from '../../utils/ai/openai';
import { createError } from '../../utils/core/error';

export function useOpenAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<any>(null);

  const analyze = useCallback(async (fields: DataField[]) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await analyzeDataWithAI(fields);
      setResults(analysis);
      return analysis;
    } catch (err) {
      const error = err instanceof Error ? err : createError('AI_ERROR', 'AI analysis failed');
      setError(error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    error,
    results,
    analyze
  };
}