import { RegressionType } from './types';

import { createError } from '../../core/error';

export function performLinearRegression(X: number[][], y: number[]) {
  validateInput(X, y);
  return performRegression(X, y, 'linear');
}

export function performLogisticRegression(X: number[][], y: number[]) {
  validateInput(X, y);
  return performRegression(X, y, 'logistic');
}

export function performPolynomialRegression(X: number[][], y: number[], degree = 2) {
  validateInput(X, y);
  // Create polynomial features
  const polyX = X.map(x => {
    const features = [];
    for (let d = 1; d <= degree; d++) {
      features.push(x.map(xi => Math.pow(xi, d)));
    }
    return features.flat();
  });
  return performRegression(polyX, y, 'polynomial');
}

export function performRidgeRegression(X: number[][], y: number[], alpha = 1.0) {
  validateInput(X, y);
  return performRegression(X, y, 'ridge', { alpha });
}

export function performLassoRegression(X: number[][], y: number[], alpha = 1.0) {
  validateInput(X, y);
  return performRegression(X, y, 'lasso', { alpha });
}

export function performElasticNetRegression(X: number[][], y: number[], alpha = 1.0, l1Ratio = 0.5) {
  validateInput(X, y);
  return performRegression(X, y, 'elastic-net', { alpha, l1Ratio });
}

export function performStepwiseRegression(X: number[][], y: number[], threshold = 0.05) {
  validateInput(X, y);
  return performRegression(X, y, 'stepwise', { threshold });
}

export function performTimeSeriesRegression(y: number[], lag = 1) {
  if (!Array.isArray(y) || y.length < lag + 1) {
    throw createError('REGRESSION_ERROR', 'Insufficient data points for time series regression');
  }
  const X = [];
  const yLagged = [];
  for (let i = lag; i < y.length; i++) {
    X.push(y.slice(i - lag, i));
    yLagged.push(y[i]);
  }
  return performRegression(X, yLagged, 'time-series');
}

export function performQuantileRegression(X: number[][], y: number[], quantile = 0.5) {
  validateInput(X, y);
  return performRegression(X, y, 'quantile', { quantile });
}

export function performLogLogRegression(X: number[][], y: number[]) {
  validateInput(X, y);
  const logX = X.map(x => x.map(xi => Math.log(Math.max(xi, 1e-10))));
  const logY = y.map(yi => Math.log(Math.max(yi, 1e-10)));
  return performRegression(logX, logY, 'log-log');
}

function validateInput(X: number[][], y: number[]) {
  if (!Array.isArray(X) || !Array.isArray(y) || X.length === 0 || y.length === 0) {
    throw createError('REGRESSION_ERROR', 'Invalid input data');
  }
  
  // Validate numeric values
  if (X.some(row => row.some(val => !isFinite(val))) || y.some(val => !isFinite(val))) {
    throw createError('REGRESSION_ERROR', 'Input contains invalid numeric values');
  }

  if (X.some(row => row.length !== X[0].length)) {
    throw createError('REGRESSION_ERROR', 'Inconsistent number of features');
  }

  if (X.length !== y.length) {
    throw createError('REGRESSION_ERROR', 'Number of samples must match between X and y');
  }
}

interface RegressionOptions {
  degree?: number;
  alpha?: number;
  l1Ratio?: number;
  threshold?: number;
  quantile?: number;
}

interface RegressionResult {
  beta: number[][];
  predictions: number[];
  standardError: number;
  rSquared: number;
  confidence: {
    upper: number[];
    lower: number[];
  };
  metrics: {
    aic: number;
    bic: number;
    rmse: number;
    mae: number;
  };
}

function performRegression(
  X: number[][],
  y: number[],
  type: RegressionType,
  options: RegressionOptions = {}
): RegressionResult {
  validateInput(X, y);

  const n = y.length;
  const p = X[0].length;
  
  const Xb = X.map(row => [1, ...row]);
  
  // Perform regression based on type
  let beta: number[][];
  let predictions: number[];

  switch (type) {
    case 'logistic':
      ({ beta, predictions } = logisticRegression(Xb, y));
      // Transform predictions through sigmoid
      predictions = predictions.map(p => 1 / (1 + Math.exp(-p)));
      break;

    case 'ridge':
      ({ beta, predictions } = ridgeRegression(Xb, y, options.alpha || 1.0));
      break;

    case 'lasso':
      ({ beta, predictions } = lassoRegression(Xb, y, options.alpha || 1.0));
      break;

    case 'elastic-net':
      ({ beta, predictions } = elasticNetRegression(
        Xb, y, options.alpha || 1.0, options.l1Ratio || 0.5
      ));
      break;

    case 'stepwise':
      ({ beta, predictions } = stepwiseRegression(Xb, y, options.threshold || 0.05));
      break;

    case 'quantile':
      ({ beta, predictions } = quantileRegression(Xb, y, options.quantile || 0.5));
      break;

    case 'polynomial':
      const degree = options.degree || 2;
      const polyX = generatePolynomialFeatures(Xb, degree);
      ({ beta, predictions } = linearRegression(polyX, y));
      break;

    case 'time-series':
      const lag = options.lag || 1;
      ({ beta, predictions } = performTimeSeriesRegression(y, lag));
      break;

    case 'log-log':
      // Transform data to log scale
      const logX = Xb.map(row => row.map(x => Math.log(Math.max(x, 1e-10))));
      const logY = y.map(yi => Math.log(Math.max(yi, 1e-10)));
      ({ beta, predictions } = linearRegression(logX, logY));
      // Transform predictions back to original scale
      predictions = predictions.map(p => Math.exp(p));
      break;

    default:
      ({ beta, predictions } = linearRegression(Xb, y));
  }
  
  // Calculate confidence intervals
  const residuals = y.map((yi, i) => yi - predictions[i]);
  const mse = residuals.reduce((sum, r) => sum + r * r, 0) / (n - p - 1);
  const se = Math.sqrt(mse);
  const tValue = getTValue(n - p - 1, 0.975); // 95% confidence level
  
  const confidence = {
    upper: predictions.map(pred => pred + tValue * se),
    lower: predictions.map(pred => pred - tValue * se)
  };
  
  // Calculate additional metrics
  const rSquared = calculateRSquared(y, predictions);
  const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - p - 1));
  const fStatistic = calculateFStatistic(y, predictions, p);
  const aic = n * Math.log(mse) + 2 * (p + 1);
  const bic = n * Math.log(mse) + Math.log(n) * (p + 1);
  const rmse = Math.sqrt(mse);
  const mae = residuals.reduce((sum, r) => sum + Math.abs(r), 0) / n;

  return {
    beta,
    predictions,
    standardError: se,
    rSquared,
    confidence,
    metrics: {
      aic,
      bic,
      rmse,
      mae
    }
  };
}

function generatePolynomialFeatures(X: number[][], degree: number): number[][] {
  return X.map(row => {
    const features = [];
    for (let d = 1; d <= degree; d++) {
      features.push(...row.slice(1).map(x => Math.pow(x, d)));
    }
    return [1, ...features]; // Keep intercept term
  });
}

function calculateFStatistic(y: number[], predictions: number[], p: number): number {
  const n = y.length;
  const mean = y.reduce((a, b) => a + b, 0) / n;
  const totalSS = y.reduce((ss, yi) => ss + Math.pow(yi - mean, 2), 0);
  const residualSS = y.reduce((ss, yi, i) => ss + Math.pow(yi - predictions[i], 2), 0);
  const regressionSS = totalSS - residualSS;
  
  return (regressionSS / p) / (residualSS / (n - p - 1));
}

function linearRegression(X: number[][], y: number[]) {
  const XtX = multiply(transpose(X), X);
  const Xty = multiply(transpose(X), y.map(yi => [yi]));
  const beta = solve(XtX, Xty);
  const predictions = X.map(row => dotProduct(row, beta.map(b => b[0])));
  return { beta, predictions };
}

function logisticRegression(X: number[][], y: number[], options: any = {}, maxIter = 100) {
  let beta = Array(X[0].length).fill(0).map(() => [0]);
  
  for (let iter = 0; iter < maxIter; iter++) {
    const predictions = X.map(row => sigmoid(dotProduct(row, beta.map(b => b[0]))));
    const W = predictions.map(p => p * (1 - p));
    const z = predictions.map((p, i) => Math.log(p / (1 - p)) + (y[i] - p) / (p * (1 - p)));
    
    const XtWX = multiply(transpose(X), multiply(diag(W), X));
    const XtWz = multiply(transpose(X), multiply(diag(W), z.map(zi => [zi])));
    const update = solve(XtWX, XtWz);
    
    beta = beta.map((b, i) => [b[0] + update[i][0]]);
  }
  
  const predictions = X.map(row => sigmoid(dotProduct(row, beta.map(b => b[0]))));
  return { beta, predictions };
}

function ridgeRegression(X: number[][], y: number[], alpha: number) {
  const n = X[0].length;
  const XtX = multiply(transpose(X), X);
  const penalty = diag(Array(n).fill(alpha));
  const regularizedXtX = add(XtX, penalty);
  const Xty = multiply(transpose(X), y.map(yi => [yi]));
  const beta = solve(regularizedXtX, Xty);
  const predictions = X.map(row => dotProduct(row, beta.map(b => b[0])));
  return { beta, predictions };
}

function lassoRegression(X: number[][], y: number[], alpha: number, maxIter = 100) {
  let beta = Array(X[0].length).fill(0).map(() => [0]);
  
  for (let iter = 0; iter < maxIter; iter++) {
    for (let j = 0; j < beta.length; j++) {
      const oldBeta = beta[j][0];
      const r = y.map((yi, i) => yi - dotProduct(X[i], beta.map(b => b[0])) + oldBeta * X[i][j]);
      const xj = X.map(row => row[j]);
      const rho = dotProduct(xj, r);
      beta[j][0] = softThreshold(rho, alpha) / dotProduct(xj, xj);
    }
  }
  
  const predictions = X.map(row => dotProduct(row, beta.map(b => b[0])));
  return { beta, predictions };
}

function elasticNetRegression(X: number[][], y: number[], alpha: number, l1Ratio: number) {
  const lassoAlpha = alpha * l1Ratio;
  const ridgeAlpha = alpha * (1 - l1Ratio);
  
  // Combine Lasso and Ridge penalties
  const { beta: lassoBeta } = lassoRegression(X, y, lassoAlpha);
  const { beta: ridgeBeta } = ridgeRegression(X, y, ridgeAlpha);
  
  const beta = lassoBeta.map((b, i) => [b[0] + ridgeBeta[i][0]]);
  const predictions = X.map(row => dotProduct(row, beta.map(b => b[0])));
  
  return { beta, predictions };
}

function stepwiseRegression(X: number[][], y: number[], threshold: number) {
  const n = X[0].length;
  const selectedFeatures = new Set<number>();
  let beta = Array(n).fill(0).map(() => [0]);
  
  while (selectedFeatures.size < n) {
    let bestFeature = -1;
    let bestScore = -Infinity;
    
    for (let j = 0; j < n; j++) {
      if (selectedFeatures.has(j)) continue;
      
      const features = [...selectedFeatures, j];
      const Xsub = X.map(row => features.map(f => row[f]));
      const { beta: tempBeta } = linearRegression(Xsub, y);
      const predictions = Xsub.map(row => dotProduct(row, tempBeta.map(b => b[0])));
      const score = calculateRSquared(y, predictions);
      
      if (score > bestScore) {
        bestScore = score;
        bestFeature = j;
      }
    }
    
    if (bestScore < threshold) break;
    selectedFeatures.add(bestFeature);
    
    const Xfinal = X.map(row => [...selectedFeatures].map(f => row[f]));
    const { beta: newBeta } = linearRegression(Xfinal, y);
    beta = beta.map((_, i) => selectedFeatures.has(i) ? [newBeta[i][0]] : [0]);
  }
  
  const predictions = X.map(row => dotProduct(row, beta.map(b => b[0])));
  return { beta, predictions };
}

function quantileRegression(X: number[][], y: number[], quantile: number) {
  const n = X.length;
  const p = X[0].length;
  let beta = Array(p).fill(0).map(() => [0]);
  
  const maxIter = 1000;
  const tolerance = 1e-6;
  
  for (let iter = 0; iter < maxIter; iter++) {
    const oldBeta = beta.map(b => b[0]);
    const predictions = X.map(row => dotProduct(row, beta.map(b => b[0])));
    const residuals = y.map((yi, i) => yi - predictions[i]);
    
    const weights = residuals.map(r => {
      if (Math.abs(r) < tolerance) return 1e10;
      return quantile * Math.max(0, r) + (1 - quantile) * Math.max(0, -r);
    });
    
    const XtWX = multiply(transpose(X), multiply(diag(weights), X));
    const XtWy = multiply(transpose(X), multiply(diag(weights), y.map(yi => [yi])));
    beta = solve(XtWX, XtWy);
    
    const change = Math.max(...beta.map((b, i) => Math.abs(b[0] - oldBeta[i])));
    if (change < tolerance) break;
  }
  
  const predictions = X.map(row => dotProduct(row, beta.map(b => b[0])));
  return { beta, predictions };
}

// Helper functions
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function softThreshold(x: number, lambda: number): number {
  if (x > lambda) return x - lambda;
  if (x < -lambda) return x + lambda;
  return 0;
}

function calculateRSquared(actual: number[], predicted: number[]): number {
  const mean = actual.reduce((a, b) => a + b, 0) / actual.length;
  const totalSS = actual.reduce((ss, y) => ss + Math.pow(y - mean, 2), 0);
  const residualSS = actual.reduce((ss, y, i) => ss + Math.pow(y - predicted[i], 2), 0);
  return 1 - (residualSS / totalSS);
}

function multiply(a: number[][], b: number[][]): number[][] {
  const result = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < a[0].length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

function solve(A: number[][], b: number[][]): number[][] {
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i][0]]);
  
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = j;
      }
    }
    
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    for (let j = i + 1; j < n; j++) {
      const c = -augmented[j][i] / augmented[i][i];
      for (let k = i; k <= n; k++) {
        if (i === k) {
          augmented[j][k] = 0;
        } else {
          augmented[j][k] += c * augmented[i][k];
        }
      }
    }
  }
  
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= augmented[i][j] * x[j];
    }
    x[i] = sum / augmented[i][i];
  }
  
  return x.map(xi => [xi]);
}

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0);
}

function diag(values: number[]): number[][] {
  return values.map((v, i) => 
    Array(values.length).fill(0).map((_, j) => i === j ? v : 0)
  );
}

function add(a: number[][], b: number[][]): number[][] {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}

function getTValue(df: number, alpha: number): number {
  // This is a simplified t-value calculation
  // In practice, you would use a proper t-distribution implementation
  return 1.96; // Approximate value for 95% confidence level
}