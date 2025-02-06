import { useState, useCallback } from 'react';
import { DataField } from '../../types';
import { analyzeData } from '../../utils/ai/core';
import { createError } from '../../utils/core/error';

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<any>(null);

  const runAnalysis = useCallback(async (fields: DataField[]) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisResults = await analyzeData(fields);
      setResults(analysisResults);
      return analysisResults;
    } catch (err) {
      const error = err instanceof Error ? err : createError('ANALYSIS_ERROR', 'Analysis failed');
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