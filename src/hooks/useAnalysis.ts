import { useState, useCallback, useEffect } from 'react';
import type { DataField, AnalyzedData } from '@types/data';
import { processData } from '@utils/analysis/data/processing';
import { analyzeFields } from '@utils/analysis/statistics/analysis';
import { createError } from '@utils/core/error';

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<AnalyzedData | null>(null);
  const [progress, setProgress] = useState(0);

  const analyze = useCallback(async (fields: DataField[]) => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    try {
      // Process data
      setProgress(25);
      const processedFields = processData(fields);

      // Analyze data
      setProgress(50);
      const analysis = await analyzeFields(processedFields);
      setProgress(100);

      setResults(analysis);
      return analysis;
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
    progress,
    analyze
  };
}