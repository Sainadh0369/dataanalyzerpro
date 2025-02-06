import { DataField } from '../../../types';
import { ValidationResult } from './types';
import { validateField } from './field';

export function validateDataset(fields: DataField[]): ValidationResult {
  if (!Array.isArray(fields) || fields.length === 0) {
    return {
      isValid: false,
      error: 'No data fields provided'
    };
  }

  for (const field of fields) {
    const fieldValidation = validateField(field);
    if (!fieldValidation.isValid) {
      return fieldValidation;
    }
  }

  return { isValid: true };
}