import { ValidationError } from '../error/types';
import { isValidValueForType } from './fieldValidation';

export function validateRequired(value: unknown, fieldName: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED_FIELD'
    };
  }
  return null;
}

export function validateType(
  value: unknown,
  type: string,
  fieldName: string
): ValidationError | null {
  if (!isValidValueForType(value, type)) {
    return {
      field: fieldName,
      message: `${fieldName} must be of type ${type}`,
      code: 'INVALID_TYPE'
    };
  }
  return null;
}

export function validateArray(
  value: unknown[],
  fieldName: string,
  options: { minLength?: number; maxLength?: number } = {}
): ValidationError | null {
  if (!Array.isArray(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be an array`,
      code: 'INVALID_TYPE'
    };
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must have at least ${options.minLength} items`,
      code: 'INVALID_LENGTH'
    };
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must have at most ${options.maxLength} items`,
      code: 'INVALID_LENGTH'
    };
  }

  return null;
}