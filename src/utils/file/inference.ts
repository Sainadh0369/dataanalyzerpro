import { DataField } from '../types';

export function inferFieldType(values: any[]): DataField['type'] {
  if (!Array.isArray(values) || values.length === 0) {
    return 'string';
  }

  // Filter out null, undefined, and empty strings
  const nonNullValues = values.filter(v => v != null && v !== '' && v !== undefined);
  if (nonNullValues.length === 0) return 'string';
  
  // Try to infer the type based on the values
  const typeChecks = nonNullValues.map(value => {
    // Handle Excel date numbers
    if (typeof value === 'number' && value > 25569 && value < 50000) {
      return 'date';
    }
    
    // Handle regular numbers
    if (typeof value === 'number' || (!isNaN(Number(value)) && value !== '')) {
      return 'number';
    }
    
    // Handle dates
    const dateStr = String(value);
    if (!isNaN(Date.parse(dateStr))) {
      return 'date';
    }
    
    // Handle booleans
    if (typeof value === 'boolean' || ['true', 'false', '0', '1'].includes(String(value).toLowerCase())) {
      return 'boolean';
    }
    
    return 'string';
  });
  
  const uniqueTypes = [...new Set(typeChecks)];
  if (uniqueTypes.length === 1) return uniqueTypes[0] as DataField['type'];
  if (uniqueTypes.includes('number') && uniqueTypes.length === 2 && uniqueTypes.includes('string')) {
    return 'number'; // Handle cases where some numbers are stored as strings
  }
  return 'string';
}