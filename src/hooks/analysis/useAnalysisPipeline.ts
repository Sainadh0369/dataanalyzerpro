import { useState, useCallback } from 'react';
import { DataField } from '../../types';
import { PipelineManager } from '../../utils/core/pipeline';
import { ANALYSIS_STAGES, createAnalysisStages } from '../../utils/analysis/stages';
import { createError } from '../../utils/core/error';

export function useAnalysisPipeline() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<any>(null);
  const [pipeline, setPipeline] = useState(() => new PipelineManager(ANALYSIS_STAGES));

  const runAnalysis = useCallback(async (fields: DataField[]) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const stages = createAnalysisStages(fields);
      const analysisResults = await pipeline.execute(stages, results => {
        setResults({
          mlAnalysis: results[1],
          nlpAnalysis: results[2],
          predictiveAnalysis: results[3],
          timestamp: new Date().toISOString()
        });
      });

      return analysisResults;
    } catch (err) {
      const error = err instanceof Error ? err : createError('ANALYSIS_ERROR', 'Analysis failed');
      setError(error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [pipeline]);

  return {
    isAnalyzing,
    error,
    results,
    pipeline: pipeline.getPipeline(),
    runAnalysis
  };
}