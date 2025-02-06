import { processCSV } from './processors/csv';
import { processExcel } from './processors/excel';
import { FileData } from './types';
import { createError } from '../core/error';
import { validateFile } from './validation';

export async function processFile(file: File): Promise<FileData> {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw createError('INVALID_INPUT', validation.error || 'Invalid file');
    }

    // Process based on file type
    const extension = file.name.toLowerCase().split('.').pop();
    switch (extension) {
      case 'csv':
        return processCSV(file);
      case 'xlsx':
      case 'xls':
        return processExcel(file);
      default:
        throw createError('INVALID_INPUT', 'Unsupported file type');
    }
  } catch (error) {
    console.error('File processing error:', error);
    throw error instanceof Error ? error : createError('PROCESSING_ERROR', 'Failed to process file');
  }
}