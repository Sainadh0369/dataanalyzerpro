import { createError } from '@/utils/core/error';
import { DataField } from '@types/data';
import { validateField } from '../validation';

const CHUNK_SIZE = 10000;
const MAX_SAMPLES = Number.MAX_SAFE_INTEGER;
const MEMORY_THRESHOLD = 200 * 1024 * 1024; // 200MB
const GC_INTERVAL = 10;

export function processData(fields: DataField[]): DataField[] {
  if (!fields?.length) {
    throw createError('PROCESSING_ERROR', 'No fields provided for processing');
  }

  let processedChunks = 0;
  let lastMemoryCheck = Date.now();

  return fields.map(field => {
    try {
      let cleanedValues = [];
      let processedValues = [];

      // Check memory usage periodically
      if (Date.now() - lastMemoryCheck > 1000) {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          if (memory.usedJSHeapSize > MEMORY_THRESHOLD) {
            // Clear references to help garbage collection
            cleanedValues = [];
            processedValues = [];
          }
        }
        lastMemoryCheck = Date.now();
      }

      // Clean values
      cleanedValues = cleanValues(field.value, field.type);
      
      // Handle missing values
      processedValues = processInChunks(cleanedValues, field.type);

      // Increment processed chunks
      processedChunks++;

      // Periodic cleanup
      if (processedChunks % GC_INTERVAL === 0) {
        // Clear temporary arrays to help garbage collection
        cleanedValues = [];
        processedValues = [];
      }

      return {
        ...field,
        value: processedValues
      };
    } catch (error) {
      console.error(`Processing error for field ${field.name}:`, error);
      throw createError(
        'PROCESSING_ERROR',
        `Failed to preprocess field ${field.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });
}

function cleanValues(values: any[], type: string): any[] {
  // Use TypedArray for numeric values
  if (type === 'number') {
    const buffer = new Float64Array(values.length);
    let validCount = 0;
    
    for (let i = 0; i < values.length; i++) {
      const transformed = transformNumber(values[i]);
      if (transformed !== null) {
        buffer[validCount++] = transformed;
      }
    }
    
    return Array.from(buffer.subarray(0, validCount));
  }

  return values
    .filter(v => v != null && v !== '')
    .map(v => transformValue(v, type))
    .filter(v => v != null);
}

function transformValue(value: any, type: string): any {
  switch (type) {
    case 'number':
      return transformNumber(value);
    case 'date':
      return transformDate(value);
    case 'boolean':
      return transformBoolean(value);
    default:
      return String(value).trim();
  }
}

function transformNumber(value: any): number | null {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  }
  return null;
}

function transformDate(value: any): Date | null {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function transformBoolean(value: any): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'y'].includes(lower)) return true;
    if (['false', '0', 'no', 'n'].includes(lower)) return false;
  }
  return null;
}

function processInChunks(values: any[], type: string): any[] {
  const result = [];
  for (let i = 0; i < values.length; i += CHUNK_SIZE) {
    const chunk = values.slice(i, Math.min(i + CHUNK_SIZE, values.length));
    result.push(...chunk);
  }
  return result;
}

function sampleData(data: any[], sampleSize: number): any[] {
  // Use systematic sampling for better memory efficiency
  const result = new Array(sampleSize);
  const step = data.length / sampleSize;
  
  for (let i = 0; i < sampleSize; i++) {
    const index = Math.min(Math.floor(i * step), data.length - 1);
    result[i] = data[index];
  }
  
  return result;
}