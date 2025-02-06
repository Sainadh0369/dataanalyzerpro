// Error type definitions
export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorDetails {
  code: string;
  message: string;
  severity: ErrorSeverity;
  field?: string;
  value?: unknown;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}