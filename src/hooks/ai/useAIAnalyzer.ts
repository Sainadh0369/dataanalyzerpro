import { useState, useCallback } from 'react';
import { DataField } from '../../types';
import { AIAnalyzer } from '../../utils/ai/analyzer';
import { useOpenAI } from './useOpenAI';
import { createError } from '../../utils/core/error';

export function useAIAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { analyze: analyzeWithAI } = useOpenAI();

  const analyze = useCallback(async (fields: DataField[]) => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    try {
      // Run traditional analysis
      const analyzer = new AIAnalyzer(fields);
      const analysisResults = await analyzer.analyze();
      setProgress(50);

      // Enhance with OpenAI analysis
      const aiResults = await analyzeWithAI(fields);
      setProgress(100);

      const combinedResults = {
        ...analysisResults,
        aiInsights: aiResults
      };

      setResults(combinedResults);
      return combinedResults;
    } catch (err) {
      const error = err instanceof Error ? err : createError('ANALYSIS_ERROR', 'Analysis failed');
      setError(error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeWithAI]);

  return {
    isAnalyzing,
    error,
    results,
    progress,
    analyze
  };
}