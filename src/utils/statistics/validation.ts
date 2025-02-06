export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function validateNumericData(values: any[]): number[] {
  return values.filter(isValidNumber);
}