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
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  const workers: Worker[] = [];
  const MAX_WORKERS = navigator.hardwareConcurrency || 4;
  const MEMORY_CHECK_INTERVAL = 1000; // Check memory every second

  // Monitor memory usage
  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(async () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usageInMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));
        setMemoryUsage(usageInMB);

        // Force garbage collection if memory usage is too high
        if (usageInMB > 500) { // 500MB threshold
          workers.forEach(worker => worker.terminate());
          workers.length = 0;
          global.gc?.();
        }
      }
    }, MEMORY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const analyze = useCallback(async (fields: DataField[]): Promise<AnalyzedData> => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    setMemoryUsage(0);

    try {
      const chunks = splitDataIntoChunks(fields);
      let mergedResults: any[] = [];

      // Process chunks sequentially to control memory usage
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const worker = new Worker(
          new URL('../workers/analysis.worker.ts', import.meta.url),
          { type: 'module' }
        );
        workers.push(worker);

        const result = await new Promise((resolve, reject) => {
            worker.onmessage = (e) => {
              const { type, payload } = e.data;
              
              if (type === 'progress') {
                const totalProgress = (i / chunks.length) * 100 + (payload / chunks.length);
                setProgress(Math.round(totalProgress));
              } else if (type === 'complete') {
                worker.terminate();
                resolve(payload);
              } else if (type === 'error') {
                worker.terminate();
                reject(new Error(payload));
              }
            };

            worker.postMessage({ fields: chunk });
        });

        mergedResults.push(result);
        
        // Clean up after each chunk
        worker.terminate();
        global.gc?.();
      }

      return mergeResults(mergedResults);
    } catch (err) {
      const error = err instanceof Error ? err : createError('ANALYSIS_ERROR', 'Analysis failed');
      setError(error);
      throw error;
    } finally {
      setIsAnalyzing(false);
      workers.forEach(worker => worker.terminate());
      workers.length = 0;
    }
  }, []);

  function splitDataIntoChunks(fields: DataField[]): DataField[][] {
    const chunkSize = Math.ceil(fields[0].value.length / MAX_WORKERS);
    const chunks: DataField[][] = [];
    
    for (let i = 0; i < fields[0].value.length; i += chunkSize) {
      const chunk = fields.map(field => ({
        ...field,
        value: field.value.slice(i, Math.min(i + chunkSize, field.value.length))
      }));
      chunks.push(chunk);
    }
    
    return chunks;
  }

  return {
    isAnalyzing,
    error,
    results,
    progress,
    analyze
  };
}