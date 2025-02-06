```typescript
import { AppError, createError, ErrorCode } from '../core/error';
import type { ValidationResult } from '../core/types';

export function handleValidationError(
  code: ErrorCode,
  message: string,
  field?: string
): ValidationResult {
  return {
    isValid: false,
    error: message,
    details: field ? { field } : undefined
  };
}

export function throwValidationError(
  code: ErrorCode,
  message: string,
  field?: string
): never {
  throw createError(code, message, field ? { field } : undefined);
}

export function validateOrThrow(result: ValidationResult): void {
  if (!result.isValid) {
    throwValidationError(
      'VALIDATION_ERROR',
      result.error || 'Validation failed',
      result.details
    );
  }
}

export function wrapValidationErrors<T>(
  fn: () => T,
  errorMessage: string = 'Validation failed'
): ValidationResult {
  try {
    fn();
    return { isValid: true };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        isValid: false,
        error: error.message,
        details: error.details
      };
    }
    return {
      isValid: false,
      error: errorMessage
    };
  }
}
```