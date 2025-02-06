import { calculateMean } from './calculations';

export function calculateCorrelations(fields: DataField[]): Record<string, number> {
  const correlations: Record<string, number> = {};
  
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const field1 = fields[i];
      const field2 = fields[j];
      const key = `${field1.name}_${field2.name}`;
      correlations[key] = calculateCorrelation(
        field1.value as number[],
        field2.value as number[]
      );
    }
  }
  
  return correlations;
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (!x?.length || !y?.length) return 0;
  const n = Math.min(x.length, y.length);
  
  // Validate input data
  if (n < 2) return 0;
  
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const deltaX = x[i] - meanX;
    const deltaY = y[i] - meanY;
    numerator += deltaX * deltaY;
    denomX += deltaX * deltaX;
    denomY += deltaY * deltaY;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}