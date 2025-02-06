import { parse } from 'papaparse';
import { ValidationResult } from '../../types/validation';
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES, ERROR_MESSAGES } from '../core/constants';

export function validateFile(file: File): ValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE
    };
  }

  // Check file type
  const extension = file.name.toLowerCase().split('.').pop();
  if (!extension || !SUPPORTED_FILE_TYPES.includes(extension as any)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.UNSUPPORTED_TYPE
    };
  }

  return { isValid: true };
}

export async function validateCSVContent(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    parse(file, {
      complete: () => {
        resolve({ isValid: true });
      },
      error: (error) => {
        resolve({
          isValid: false,
          error: ERROR_MESSAGES.INVALID_FILE
        });
      },
      skipEmptyLines: true
    });
  });
}