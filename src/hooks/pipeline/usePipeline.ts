import { useState, useCallback } from 'react';
import { Pipeline, PipelineResult } from '../../types/pipeline';
import { PIPELINE_STAGES } from '../../utils/pipeline/stages';
import { executePipeline } from '../../utils/pipeline/core';

export function usePipeline() {
  const [pipeline, setPipeline] = useState<Pipeline>({
    stages: [...PIPELINE_STAGES],
    currentStage: 0,
    isComplete: false
  });
  const [result, setResult] = useState<PipelineResult | null>(null);

  const processPipeline = useCallback(async (file: File) => {
    setPipeline({
      stages: [...PIPELINE_STAGES],
      currentStage: 0,
      isComplete: false
    });
    setResult(null);

    try {
      const pipelineResult = await executePipeline(file);
      setResult(pipelineResult);
      return pipelineResult;
    } catch (error) {
      const errorResult: PipelineResult = {
        success: false,
        error: error.message
      };
      setResult(errorResult);
      return errorResult;
    }
  }, []);

  return {
    pipeline,
    result,
    processPipeline
  };
}