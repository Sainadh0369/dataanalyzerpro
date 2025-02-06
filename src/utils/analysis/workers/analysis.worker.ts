import { DataField, AnalyzedData } from '@types/data';
import { analyzeFields } from '../statistics/analysis';

const CHUNK_SIZE = 50000;
const TRANSFER_CHUNK_SIZE = 512 * 1024; // Reduced transfer size
const MEMORY_LIMIT = 200 * 1024 * 1024; // 200MB worker memory limit

self.onmessage = async (event) => {
  try {
    const { fields } = event.data as { fields: DataField[] };
    
    // Process data in optimized chunks
    const chunks = Math.ceil(fields[0].value.length / CHUNK_SIZE); 
    let processedChunks = 0;
    let results = [];
    let lastMemoryCheck = Date.now();
    
    for (let i = 0; i < chunks; i++) {
      // Check memory usage periodically
      if (Date.now() - lastMemoryCheck > 1000) {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          if (memory.usedJSHeapSize > MEMORY_LIMIT) {
            // Force cleanup
            results = [];
            global.gc?.();
          }
        }
        lastMemoryCheck = Date.now();
      }

      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fields[0].value.length);
      
      // Use TypedArrays for numeric fields
      const chunkFields = fields.map(field => {
        if (field.type === 'number') {
          // Use SharedArrayBuffer for better memory efficiency
          const buffer = new Float64Array(new SharedArrayBuffer(8 * (end - start)));
          buffer.set(field.value.slice(start, end));
          return { ...field, value: buffer };
        }
        return { ...field, value: field.value.slice(start, end) };
      });
      
      // Process chunk
      const chunkResults = await analyzeFields(chunkFields);
      results.push(chunkResults);
      processedChunks++;

      // Report progress
      self.postMessage({
        type: 'progress',
        payload: {
          progress: (processedChunks / chunks) * 100,
          currentChunk: processedChunks,
          totalChunks: chunks
        }
      });

      // Stream results in smaller chunks
      if (results.length >= TRANSFER_CHUNK_SIZE) {
        self.postMessage({
          type: 'chunk',
          payload: results
        });
        results = [];
      }
    }
    
    // Send remaining results
    if (results.length > 0) {
      self.postMessage({
        type: 'chunk',
        payload: results
      });
    }
    
    self.postMessage({ 
      type: 'complete',
      payload: { totalChunks: chunks }
    });
  } catch (error) {
    self.postMessage({ 
      type: 'error',
      error: error instanceof Error ? error.message : 'Analysis failed' 
    });
  }
};