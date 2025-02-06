export type ErrorCode = 
  | 'INVALID_INPUT'
  | 'PROCESSING_ERROR'
  | 'VALIDATION_ERROR'
  | 'ANALYSIS_ERROR';

export class AppError extends Error {
  code: ErrorCode;
  details?: Record<string, any>;

  constructor(code: ErrorCode, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export function createError(code: ErrorCode, message: string, details?: Record<string, any>): AppError {
  return new AppError(code, message, details);
}