import { parse } from 'papaparse';
import { DataField } from '../../../types';
import { inferFieldType } from '../inference';
import { aggregateData } from '../aggregation';

// Polyfill for web worker context
const globalThis = self as any;

self.onmessage = (e: MessageEvent) => {
  const { file, chunkSize } = e.data;
  const aggregates: Record<string, {
    sum: number;
    count: number;
    min: number;
    max: number;
    values: any[];
  }> = {};
  let headers: string[] = [];
  let processedRows = 0;

  parse(file, {
    chunk: ({ data: rows }) => {
      try {
        // Initialize headers from first chunk
        if (processedRows === 0 && rows.length > 0) {
          headers = rows[0].map(String);
          headers.forEach(header => {
            aggregates[header] = {
              sum: 0,
              count: 0,
              min: Infinity,
              max: -Infinity,
              values: []
            };
          });
          rows = rows.slice(1);
        }

        // Process chunk rows
        rows.forEach(row => {
          headers.forEach((header, i) => {
            const value = row[i];
            const agg = aggregates[header];
            
            if (typeof value === 'number' && !isNaN(value)) {
              agg.sum += value;
              agg.count++;
              agg.min = Math.min(agg.min, value);
              agg.max = Math.max(agg.max, value);
            }
            
            // Keep only a sample of values for type inference
            if (agg.values.length < 1000) {
              agg.values.push(value);
            }
          });
        });

        processedRows += rows.length;
        
        // Report progress
        self.postMessage({
          type: 'progress',
          payload: { processed: processedRows }
        });

        // Free up memory after each chunk
        if (processedRows % chunkSize === 0) {
          // Clear temporary arrays
          headers.forEach(header => {
            if (aggregates[header].values.length >= 1000) {
              aggregates[header].values = aggregates[header].values.slice(0, 1000);
            }
          });
          globalThis.gc?.();
        }
      } catch (error) {
        self.postMessage({
          type: 'error',
          payload: error instanceof Error ? error.message : 'Chunk processing failed'
        });
      }
    },
    complete: () => {
      try {
        const dataFields: DataField[] = headers.map(header => ({
          name: header,
          type: inferFieldType(aggregates[header].values),
          value: aggregates[header].values,
          metadata: {
            total: aggregates[header].sum,
            average: aggregates[header].sum / aggregates[header].count,
            min: aggregates[header].min,
            max: aggregates[header].max,
            sampleSize: aggregates[header].count
          }
        }));

        self.postMessage({
          type: 'complete',
          payload: { fields: dataFields }
        });
      } catch (error) {
        self.postMessage({
          type: 'error',
          payload: error instanceof Error ? error.message : 'Failed to process data'
        });
      }
    },
    error: (error) => {
      self.postMessage({
        type: 'error',
        payload: error.message
      });
    },
    header: false,
    skipEmptyLines: true,
    chunkSize: chunkSize
  });
};