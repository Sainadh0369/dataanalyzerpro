import { ValidationResult } from './types';

export function validateInput<T>(
  input: T,
  validator: (data: T) => boolean,
  errorMessage: string
): ValidationResult {
  try {
    if (!validator(input)) {
      return {
        isValid: false,
        error: errorMessage
      };
    }
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    };
  }
}

export function validateArray<T>(
  arr: T[],
  validator: (item: T) => boolean,
  errorMessage: string
): ValidationResult {
  if (!Array.isArray(arr)) {
    return {
      isValid: false,
      error: 'Input is not an array'
    };
  }

  if (arr.length === 0) {
    return {
      isValid: false,
      error: 'Array is empty'
    };
  }

  const invalidItems = arr.filter(item => !validator(item));
  if (invalidItems.length > 0) {
    return {
      isValid: false,
      error: `${errorMessage} (${invalidItems.length} invalid items)`
    };
  }

  return { isValid: true };
}