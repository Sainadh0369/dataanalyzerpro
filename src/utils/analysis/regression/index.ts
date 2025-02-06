import { DataField } from '@/types/data';
import { RegressionResult } from './types';
import { calculateCorrelation } from '../statistics/calculations';

export function performRegression(fields: DataField[]): RegressionResult[] {
  if (!fields?.length) return [];

  // Validate input data
  const validFields = fields.filter(field => {
    const values = field.value as number[];
    return values.every(v => typeof v === 'number' && isFinite(v));
  });

  if (validFields.length < 2) return [];

  const results: RegressionResult[] = [];
  const numericFields = validFields;

  if (numericFields.length < 2) return [];

  for (let i = 0; i < numericFields.length; i++) {
    const dependent = numericFields[i];
    const independents = numericFields.filter((_, index) => index !== i);
    
    // Standardize values for numerical stability
    const y = standardize(dependent.value as number[]);
    const x = standardize(independents[0].value as number[]);
    
    // Calculate regression coefficients
    const n = Math.min(x.length, y.length);
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let j = 0; j < n; j++) {
      const xDiff = x[j] - meanX;
      numerator += xDiff * (y[j] - meanY);
      denominator += xDiff * xDiff;
    }
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Calculate predictions with confidence intervals
    const predictions = x.map(xi => {
      const predicted = slope * xi + intercept;
      return predicted;
    });
    
    // Calculate R-squared
    const totalSS = y.reduce((ss, yi) => ss + Math.pow(yi - meanY, 2), 0);
    const residualSS = y.reduce((ss, yi, i) => ss + Math.pow(yi - predictions[i], 2), 0);
    const rSquared = 1 - (residualSS / totalSS);
    
    // Calculate robust standard error using bootstrapping
    const standardError = calculateRobustStandardError(y, predictions, 1000);
    
    // Calculate confidence intervals
    const tValue = getTValue(n - 2, 0.975); // 95% confidence level
    const seSlope = standardError / Math.sqrt(denominator);
    const seIntercept = standardError * Math.sqrt(1/n + Math.pow(meanX, 2)/denominator);
    
    const confidence = {
      upper: predictions.map((pred, i) => 
        pred + tValue * standardError * Math.sqrt(1/n + Math.pow(x[i] - meanX, 2)/denominator)
      ),
      lower: predictions.map((pred, i) => 
        pred - tValue * standardError * Math.sqrt(1/n + Math.pow(x[i] - meanX, 2)/denominator)
      )
    };

    // Calculate additional metrics
    const mse = residualSS / n;
    const rmse = Math.sqrt(mse);
    const mae = y.reduce((sum, yi, i) => sum + Math.abs(yi - predictions[i]), 0) / n;
    const rsquaredAdj = 1 - ((1 - rSquared) * (n - 1) / (n - 2));
    const aic = n * Math.log(mse) + 4; // k=2 parameters (slope and intercept)
    const bic = n * Math.log(mse) + Math.log(n) * 2;

    // Calculate additional metrics for model validation
    const metrics = calculateRegressionMetrics(y, predictions);

    const result = {
      field: dependent.name,
      type: 'linear',
      coefficients: [slope],
      intercept,
      rSquared,
      standardError,
      predictions,
      actualValues: y,
      equation: `${dependent.name} = ${intercept.toFixed(3)} + ${slope.toFixed(3)}×${independents[0].name}`,
      confidence,
      metrics
    };
    results.push(result);
  }

  return results;
}

function standardize(values: number[]): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
  );
  return values.map(v => (v - mean) / (stdDev || 1));
}

function calculateRobustStandardError(actual: number[], predicted: number[], iterations: number): number {
  const n = actual.length;
  const residuals = actual.map((y, i) => y - predicted[i]);
  const bootstrapErrors = [];

  for (let i = 0; i < iterations; i++) {
    const sample = [];
    for (let j = 0; j < n; j++) {
      const idx = Math.floor(Math.random() * n);
      sample.push(residuals[idx]);
    }
    const sampleMean = sample.reduce((a, b) => a + b, 0) / n;
    bootstrapErrors.push(sampleMean);
  }

  const meanError = bootstrapErrors.reduce((a, b) => a + b, 0) / iterations;
  return Math.sqrt(
    bootstrapErrors.reduce((acc, err) => acc + Math.pow(err - meanError, 2), 0) / (iterations - 1)
  );
}

function calculateRegressionMetrics(actual: number[], predicted: number[]): {
  mse: number;
  rmse: number;
  mae: number;
  rsquaredAdj: number;
  aic: number;
  bic: number;
  crossValidation: number;
} {
  const n = actual.length;
  const residuals = actual.map((y, i) => y - predicted[i]);
  
  const mse = residuals.reduce((acc, r) => acc + r * r, 0) / n;
  const rmse = Math.sqrt(mse);
  const mae = residuals.reduce((acc, r) => acc + Math.abs(r), 0) / n;
  
  const mean = actual.reduce((a, b) => a + b, 0) / n;
  const totalSS = actual.reduce((acc, y) => acc + Math.pow(y - mean, 2), 0);
  const rSquared = 1 - (mse * n) / totalSS;
  const rsquaredAdj = 1 - ((1 - rSquared) * (n - 1)) / (n - 2);
  
  const aic = n * Math.log(mse) + 4; // k=2 parameters
  const bic = n * Math.log(mse) + Math.log(n) * 2;
  
  // K-fold cross-validation
  const k = 5;
  const foldSize = Math.floor(n / k);
  let crossValidationError = 0;
  
  for (let i = 0; i < k; i++) {
    const testIndices = new Set(
      Array.from({ length: foldSize }, (_, j) => (i * foldSize + j) % n)
    );
    const trainIndices = Array.from({ length: n }, (_, j) => j)
      .filter(j => !testIndices.has(j));
    
    const trainActual = trainIndices.map(j => actual[j]);
    const trainPredicted = trainIndices.map(j => predicted[j]);
    const testActual = Array.from(testIndices).map(j => actual[j]);
    const testPredicted = Array.from(testIndices).map(j => predicted[j]);
    
    const testMSE = testActual.reduce(
      (acc, y, j) => acc + Math.pow(y - testPredicted[j], 2),
      0
    ) / testActual.length;
    
    crossValidationError += testMSE;
  }
  
  const crossValidation = 1 - (crossValidationError / k) / totalSS;

  return {
    mse,
    rmse,
    mae,
    rsquaredAdj,
    aic,
    bic,
    crossValidation
  };
}
function getTValue(df: number, alpha: number): number {
  // Approximation of t-distribution critical value
  const a = 1 - alpha;
  if (df === 1) return Math.tan(Math.PI * (a - 0.5));
  if (df === 2) return Math.sqrt(2 / (a * (2 - a)) - 2);
  const h = 2 / (1 / (df - 0.5) + 1 / (df - 1.5));
  const w = Math.sqrt(h * a * (1 - a));
  return w * (1 - (h - w * w) * (a - 1/3) / (4 * h));
}