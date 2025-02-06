import { useState, useCallback } from 'react';
import { DataField } from '../../types';
import { analyzeDataWithAI } from '../../utils/ai/openai';
import { createError } from '../../utils/core/error';

export function useAIInsights() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [insights, setInsights] = useState<any>(null);

  const generateInsights = useCallback(async (fields: DataField[]) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const aiInsights = await analyzeDataWithAI(fields);
      setInsights(aiInsights);
      return aiInsights;
    } catch (err) {
      const error = err instanceof Error ? err : createError('AI_ERROR', 'Failed to generate AI insights');
      setError(error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    error,
    insights,
    generateInsights
  };
}