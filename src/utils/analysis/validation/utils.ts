export function isValidValueForType(value: any, type: string): boolean {
  if (value === null || value === undefined || value === '') return false;

  switch (type) {
    case 'number':
      return typeof value === 'number' && !isNaN(value) && isFinite(value);
    case 'string':
      return typeof value === 'string' && value.trim().length > 0;
    case 'date':
      return !isNaN(Date.parse(String(value)));
    case 'boolean':
      return typeof value === 'boolean';
    default:
      return false;
  }
}