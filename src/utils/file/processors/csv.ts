import { parse } from 'papaparse';
import { ERROR_MESSAGES } from '@/utils/core/constants';
import { FileData } from '../types';
import { createError } from '@/utils/core/error';
import { inferFieldType } from '../inference';
import { processData } from '@/utils/analysis/data/processing';

const CHUNK_SIZE = 10000;
const MAX_ROWS = Number.MAX_SAFE_INTEGER;

export async function processCSV(file: File): Promise<FileData> {
  return new Promise((resolve, reject) => {
    const headers: string[] = [];
    const columnValues: Record<string, any[]> = {};
    let hasData = false;
    let rowCount = 0;

    parse(file, {
      chunk: (results) => {
        const rows = results.data as any[][];
        rowCount += rows.length;
        
        if (!hasData && rows.length > 0) {
          hasData = true;
          // Process headers from first row
          rows[0].forEach(header => {
            headers.push(String(header));
            columnValues[header] = [];
          });
          // Process data rows
          rows.slice(1).forEach(row => {
            headers.forEach((header, i) => {
              columnValues[header].push(row[i]);
            });
          });
        } else {
          rows.forEach(row => {
            headers.forEach((header, i) => {
              columnValues[header].push(row[i]);
            });
          });
        }
      },
      complete: () => {
        if (!hasData || headers.length === 0) {
          reject(createError('PROCESSING_ERROR', ERROR_MESSAGES.INVALID_FILE));
          return;
        }

        // Create fields with inferred types
        let fields = headers.map(header => ({
          name: header,
          type: inferFieldType(columnValues[header]),
          value: columnValues[header]
        }));

        // Process fields to ensure data consistency
        fields = processData(fields);

        resolve({
          type: 'csv',
          content: { fields },
          name: file.name
        });
      },
      error: (error) => reject(createError('PROCESSING_ERROR', error.message)),
      header: false,
      skipEmptyLines: true,
      chunkSize: CHUNK_SIZE
    });
  });
}