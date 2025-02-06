import { useState, useCallback } from 'react';
import { DataField } from '../../types';
import { performAIAnalysis } from '../../utils/ai/pipeline';
import { createError } from '../../utils/core/error';

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<any>(null);

  const runAnalysis = useCallback(async (fields: DataField[]) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisResults = await performAIAnalysis(fields);
      setResults(analysisResults);
      return analysisResults;
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
    runAnalysis
  };
}