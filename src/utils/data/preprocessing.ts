import { DataField } from '../core/types';
import { SUPPORTED_DATA_TYPES } from '../core/constants';
import { createError } from '../core/error';

export function preprocessData(fields: DataField[]): DataField[] {
  return fields.map(field => {
    try {
      // Clean values
      const cleanedValues = cleanValues(field.value, field.type);
      
      // Handle missing values
      const processedValues = handleMissingValues(cleanedValues, field.type);

      return {
        ...field,
        value: processedValues
      };
    } catch (error) {
      throw createError(
        'PROCESSING_ERROR',
        `Failed to preprocess field ${field.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });
}

function cleanValues(values: any[], type: string): any[] {
  return values
    .filter(v => v != null && v !== '')
    .map(v => transformValue(v, type))
    .filter(v => v != null);
}

function transformValue(value: any, type: string): any {
  switch (type) {
    case 'number':
      return transformNumber(value);
    case 'date':
      return transformDate(value);
    case 'boolean':
      return transformBoolean(value);
    default:
      return String(value).trim();
  }
}

function transformNumber(value: any): number | null {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  }
  return null;
}

function transformDate(value: any): Date | null {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function transformBoolean(value: any): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'y'].includes(lower)) return true;
    if (['false', '0', 'no', 'n'].includes(lower)) return false;
  }
  return null;
}

function handleMissingValues(values: any[], type: string): any[] {
  if (values.length === 0) return values;
  
  switch (type) {
    case 'number':
      return handleNumericMissing(values as number[]);
    default:
      return values;
  }
}

function handleNumericMissing(values: number[]): number[] {
  const validValues = values.filter(v => v != null);
  if (validValues.length === 0) return values;
  
  const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  return values.map(v => v ?? mean);
}