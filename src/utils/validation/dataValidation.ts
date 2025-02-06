import { DataField, ValidationResult } from '../core/types';
import { createError } from '../core/error';

export function validateDataset(fields: DataField[]): ValidationResult {
  try {
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
  } catch (error) {
    throw createError(
      'VALIDATION_ERROR',
      error instanceof Error ? error.message : 'Validation failed'
    );
  }
}

export function validateField(field: DataField): ValidationResult {
  if (!field.name?.trim()) {
    return {
      isValid: false,
      error: 'Field name is required'
    };
  }

  if (!field.type || !['number', 'string', 'date', 'boolean'].includes(field.type)) {
    return {
      isValid: false,
      error: `Invalid type for field ${field.name}`
    };
  }

  if (!Array.isArray(field.value) || field.value.length === 0) {
    return {
      isValid: false,
      error: `No values provided for field ${field.name}`
    };
  }

  return { isValid: true };
}

export function validateNumericData(values: any[]): number[] {
  return values.filter(v => 
    typeof v === 'number' && !isNaN(v) && isFinite(v)
  );
}