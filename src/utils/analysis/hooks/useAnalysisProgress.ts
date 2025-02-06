import { useState, useCallback } from 'react';

export function useAnalysisProgress() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string>('');

  const updateProgress = useCallback((newProgress: number, stageName?: string) => {
    setProgress(Math.round(newProgress));
    if (stageName) {
      setStage(stageName);
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(0);
    setStage('');
  }, []);

  return {
    progress,
    stage,
    updateProgress,
    resetProgress
  };
}