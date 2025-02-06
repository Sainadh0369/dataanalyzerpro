import { ErrorDetails, ErrorCode } from './types';
import { ERROR_CODES } from './constants';

export function createErrorDetails(
  code: ErrorCode,
  message: string,
  details?: Partial<ErrorDetails>
): ErrorDetails {
  return {
    code,
    message,
    severity: details?.severity || 'error',
    field: details?.field,
    value: details?.value,
    details: details?.details
  };
}

export function handleError(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return createErrorDetails(
      ERROR_CODES.INTERNAL_ERROR,
      error.message
    );
  }
  
  if (typeof error === 'string') {
    return createErrorDetails(
      ERROR_CODES.INTERNAL_ERROR,
      error
    );
  }
  
  return createErrorDetails(
    ERROR_CODES.INTERNAL_ERROR,
    'An unknown error occurred'
  );
}