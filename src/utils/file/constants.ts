export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const SUPPORTED_FILE_TYPES = ['csv', 'xlsx', 'xls'] as const;

export const FILE_ERROR_MESSAGES = {
  SIZE_EXCEEDED: (maxSize: number) => 
    `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
  UNSUPPORTED_TYPE: (types: string[]) => 
    `Unsupported file type. Supported formats: ${types.join(', ')}`,
  INVALID_FORMAT: 'Invalid file format',
  PROCESSING_FAILED: 'Failed to process file'
} as const;