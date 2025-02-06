export interface AppError {
  code: string;
  message: string;
  name: string;
  details?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ProcessingResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AnalysisError {
  code: string;
  message: string;
  details?: Record<string, any>;
}