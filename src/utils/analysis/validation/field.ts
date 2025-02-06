import { DataField } from '../../../types';
import { ValidationResult } from './types';
import { isValidValueForType } from './utils';

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

  const invalidValues = field.value.filter(v => !isValidValueForType(v, field.type));
  if (invalidValues.length > 0) {
    return {
      isValid: false,
      error: `Field ${field.name} contains ${invalidValues.length} invalid values`
    };
  }

  return { isValid: true };
}