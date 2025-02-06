export interface RegressionResult {
  field: string;
  type: RegressionType;
  coefficients: number[];
  intercept: number;
  rSquared: number;
  standardError: number;
  predictions: number[];
  actualValues: number[];
  equation: string;
  confidence: {
    upper: number[];
    lower: number[];
  };
  metrics: {
    mse: number;    // Mean Squared Error
    rmse: number;   // Root Mean Squared Error
    mae: number;    // Mean Absolute Error
    rsquaredAdj: number; // Adjusted R-squared
    aic: number;    // Akaike Information Criterion
    bic: number;    // Bayesian Information Criterion
  };
}

export type RegressionType = 
  | 'linear'
  | 'multiple'
  | 'multiple'
  | 'logistic'
  | 'polynomial'
  | 'ridge'
  | 'lasso'
  | 'elastic-net'
  | 'stepwise'
  | 'time-series'
  | 'quantile'
  | 'log-log';

export interface RegressionOptions {
  type: RegressionType;
  polynomialDegree?: number;
  alpha?: number; // Regularization parameter for Ridge/Lasso
  l1Ratio?: number; // Elastic Net mixing parameter
  quantile?: number; // Quantile regression parameter
  stepwiseThreshold?: number;
  timeSeriesLag?: number;
  selectedFeatures?: number[];
  validationMetrics?: {
    crossValidationScore: number;
    testSetScore: number;
  };
}