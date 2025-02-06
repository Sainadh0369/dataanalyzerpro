export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: Record<string, any>;
}

export interface FieldValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}