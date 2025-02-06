import { DataField } from '../../types';

export function calculateCorrelations(fields: DataField[]): Record<string, number> {
  const correlations: Record<string, number> = {};
  
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const field1 = fields[i];
      const field2 = fields[j];
      
      const correlation = calculatePearsonCorrelation(
        field1.value as number[],
        field2.value as number[]
      );
      
      correlations[`${field1.name}_${field2.name}`] = correlation;
    }
  }
  
  return correlations;
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }
  
  return numerator / Math.sqrt(denomX * denomY);
}