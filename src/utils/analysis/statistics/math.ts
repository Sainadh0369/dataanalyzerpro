// Basic statistical calculations
export function calculateMean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateMedian(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateStandardDeviation(values: number[], mean: number): number {
  if (!values.length) return 0;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

export function calculateVariance(values: number[]): number {
  if (!values.length) return 0;
  const mean = calculateMean(values);
  return values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
}

export function calculateTrendStrength(fields: { value: number[] }[]): number {
  const trends = fields.map(field => {
    const values = field.value;
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstMean = calculateMean(firstHalf);
    const secondMean = calculateMean(secondHalf);
    
    return Math.abs((secondMean - firstMean) / firstMean);
  });

  return calculateMean(trends);
}