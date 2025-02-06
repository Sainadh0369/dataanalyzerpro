import { ValidationError } from '../error/types';
import { validateRequired, validateType, validateArray } from './rules';
import { DataField } from '../../types';

export class Validator {
  private errors: ValidationError[] = [];

  validate(field: DataField): boolean {
    this.errors = [];

    // Required field validations
    const requiredErrors = [
      validateRequired(field.name, 'name'),
      validateRequired(field.type, 'type'),
      validateRequired(field.value, 'value')
    ].filter((error): error is ValidationError => error !== null);

    this.errors.push(...requiredErrors);
    if (requiredErrors.length > 0) return false;

    // Type validation
    const typeError = validateType(field.type, 'string', 'type');
    if (typeError) {
      this.errors.push(typeError);
      return false;
    }

    // Array validation
    const arrayError = validateArray(field.value, 'value', { minLength: 1 });
    if (arrayError) {
      this.errors.push(arrayError);
      return false;
    }

    // Value type validation
    const invalidValues = field.value.filter(v => !validateType(v, field.type, 'value'));
    if (invalidValues.length > 0) {
      this.errors.push({
        field: 'value',
        message: `Contains ${invalidValues.length} invalid values`,
        code: 'INVALID_TYPE'
      });
      return false;
    }

    return true;
  }

  getErrors(): ValidationError[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}