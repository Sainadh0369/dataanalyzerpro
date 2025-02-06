export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: Record<string, any>;
}