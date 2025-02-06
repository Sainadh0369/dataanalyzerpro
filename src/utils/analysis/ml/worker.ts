import { DataField } from '../../../types';

const CHUNK_SIZE = 1000;

self.onmessage = (e: MessageEvent) => {
  const { fields } = e.data as { fields: DataField[] };
  
  try {
    const numericFields = fields.filter(f => f.type === 'number' && Array.isArray(f.value));
    let processedChunks = 0;
    const totalChunks = Math.ceil(numericFields[0].value.length / CHUNK_SIZE);

    // Process data in chunks
    const results = processInChunks(numericFields);

    self.postMessage({ 
      type: 'complete',
      payload: results
    });
  } catch (error) {
    self.postMessage({ 
      type: 'error',
      payload: error instanceof Error ? error.message : 'ML analysis failed'
    });
  }
};

function processInChunks(fields: DataField[]) {
  const predictions: Record<string, number[]> = {};
  const features: string[] = fields.map(f => f.name);
  let confidence = 0;

  for (let i = 0; i < fields[0].value.length; i += CHUNK_SIZE) {
    const chunkEnd = Math.min(i + CHUNK_SIZE, fields[0].value.length);
    
    // Process each field's chunk
    fields.forEach(field => {
      const chunk = field.value.slice(i, chunkEnd) as number[];
      if (!predictions[field.name]) {
        predictions[field.name] = [];
      }
      
      // Simple moving average prediction for the chunk
      const prediction = calculateMovingAverage(chunk);
      predictions[field.name].push(...prediction);
    });

    // Update progress
    const progress = Math.min(100, (i / fields[0].value.length) * 100);
    self.postMessage({ type: 'progress', payload: progress });
  }

  return {
    predictions,
    confidence: calculateConfidence(predictions),
    features
  };
}

function calculateMovingAverage(values: number[], window = 3): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(values.length, i + Math.floor(window / 2) + 1);
    const windowValues = values.slice(start, end);
    result.push(windowValues.reduce((a, b) => a + b, 0) / windowValues.length);
  }
  return result;
}

function calculateConfidence(predictions: Record<string, number[]>): number {
  const confidences = Object.values(predictions).map(values => {
    const diffs = values.slice(1).map((v, i) => Math.abs(v - values[i]));
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return 1 / (1 + avgDiff);
  });
  return confidences.reduce((a, b) => a + b, 0) / confidences.length;
}