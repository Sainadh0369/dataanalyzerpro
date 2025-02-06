import { DataField } from '../../../types';
import { calculateLinearRegression } from './calculations';
import type { RegressionResult } from './types';

export function performRegression(fields: DataField[]): RegressionResult[] {
  const numericFields = fields.filter(field => field.type === 'number');
  const results: RegressionResult[] = [];

  for (let i = 0; i < numericFields.length; i++) {
    const dependent = numericFields[i];
    const independent = numericFields.filter((_, index) => index !== i);

    if (independent.length > 0) {
      const result = calculateRegression(dependent, independent);
      results.push(result);
    }
  }

  return results;
}

function calculateRegression(
  dependent: DataField,
  independent: DataField[]
): RegressionResult {
  const y = dependent.value as number[];
  const x = independent[0].value as number[];

  const { slope, intercept, rSquared } = calculateLinearRegression(x, y);
  const predictions = x.map(x => slope * x + intercept);

  return {
    field: dependent.name,
    coefficients: [slope],
    intercept,
    rSquared,
    predictions,
    equation: generateEquation(dependent.name, independent[0].name, slope, intercept)
  };
}

function generateEquation(
  dependent: string,
  independent: string,
  slope: number,
  intercept: number
): string {
  const sign = intercept >= 0 ? '+' : '';
  return `${dependent} = ${slope.toFixed(3)} × ${independent} ${sign} ${intercept.toFixed(3)}`;
}