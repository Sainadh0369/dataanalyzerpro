import { useCallback, useRef } from 'react';
import type { DataField, AnalyzedData } from '@types/data';

export function useAnalysisWorker() {
  const workerRef = useRef<Worker | null>(null);

  const analyze = useCallback(async (fields: DataField[]): Promise<AnalyzedData> => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/analysis.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }

    return new Promise((resolve, reject) => {
      const worker = workerRef.current!;
      
      worker.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      };

      worker.onerror = (error) => {
        reject(error);
      };

      worker.postMessage({ fields });
    });
  }, []);

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return { analyze, cleanup };
}