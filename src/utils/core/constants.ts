export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const SUPPORTED_FILE_TYPES = ['csv', 'xlsx', 'xls'] as const;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
  UNSUPPORTED_TYPE: 'Supported formats: CSV and Excel files',
  INVALID_FILE: 'Invalid file format or empty file',
  PROCESSING_ERROR: 'Failed to process file',
  ANALYSIS_ERROR: 'Failed to analyze data',
  VALIDATION_ERROR: 'Invalid input data'
} as const;