import * as XLSX from 'xlsx';
import { FileData } from '../types';
import { createError } from '@/utils/core/error';
import { inferFieldType } from '../inference';
import { processData } from '@/utils/analysis/data/processing';

const CHUNK_SIZE = 1000;
const MAX_ROWS = 100000;

export async function processExcel(file: File): Promise<FileData> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);

    if (!workbook.SheetNames.length) {
      throw createError('PROCESSING_ERROR', 'Excel file contains no sheets');
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false,
      dateNF: 'yyyy-mm-dd',
      blankrows: false
    });

    if (!jsonData || jsonData.length < 2) {
      throw createError('PROCESSING_ERROR', 'Invalid or empty Excel file');
    }

    // Check row limit
    if (jsonData.length > MAX_ROWS) {
      throw createError('PROCESSING_ERROR', `File exceeds maximum limit of ${MAX_ROWS} rows`);
    }

    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1) as any[][];

    // Process columns into fields
    const fields = headers.map((name, columnIndex) => {
      const columnValues = [];
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const values = chunk.map(row => {
          const value = row[columnIndex];
          // Handle Excel date numbers
          if (typeof value === 'number' && value > 25569 && value < 50000) {
            return XLSX.SSF.format('yyyy-mm-dd', value);
          }
          return value;
        });
        columnValues.push(...values);
      }

      return {
        name: String(name),
        type: inferFieldType(columnValues),
        value: columnValues
      };
    });

    // Process the fields to ensure data consistency
    const processedFields = processData(fields);

    return {
      type: 'csv', // We convert to our standard format
      content: { fields: processedFields },
      name: file.name
    };
  } catch (error) {
    console.error('Excel processing error:', error);
    throw createError(
      'PROCESSING_ERROR',
      error instanceof Error ? error.message : 'Failed to process Excel file'
    );
  }
}