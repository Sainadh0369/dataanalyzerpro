import { FileData } from './types';
import { createError } from '../core/error';
import { validateFile, validateCSVContent } from './validation';
import { SUPPORTED_FILE_TYPES, ERROR_MESSAGES } from '../core/constants';
import { processCSV } from './processors/csv';
import { processExcel } from './processors/excel';
import CSVWorker from './csvWorker?worker';

const CHUNK_SIZE = 500000; // Increased chunk size
const MEMORY_THRESHOLD = 200 * 1024 * 1024; // 200MB memory threshold
const GC_INTERVAL = 10;

let processedChunks = 0;

function getFileType(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  if (extension && SUPPORTED_FILE_TYPES.includes(extension as any)) {
    return extension;
  }
  throw createError('INVALID_INPUT', ERROR_MESSAGES.UNSUPPORTED_TYPE);
}

export async function processFile(file: File): Promise<FileData> {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw createError('INVALID_INPUT', validation.error || 'Invalid file');
    }
    
    const fileType = getFileType(file.name);
    let result: FileData;

    switch (fileType) {
      case 'csv':
        const contentValidation = await validateCSVContent(file);
        if (!contentValidation.isValid) {
          throw createError('INVALID_INPUT', contentValidation.error || 'Invalid file content');
        }
        result = await processCSV(file);
        break;
        
      case 'xlsx':
      case 'xls':
        result = await processExcel(file);
        break;
        
      default:
        throw createError('INVALID_INPUT', ERROR_MESSAGES.UNSUPPORTED_TYPE);
    }

    // Validate result
    if (!result?.content?.fields?.length) {
      throw createError('PROCESSING_ERROR', 'No data found in file');
    }

    return result;

  } catch (error) {
    console.error('File processing error:', error);
    throw error instanceof Error ? error : createError('PROCESSING_ERROR', ERROR_MESSAGES.PROCESSING_ERROR);
  }
}