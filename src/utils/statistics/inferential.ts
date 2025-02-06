import { DataField } from '../../types';

export interface HypothesisTest {
  testName: string;
  statistic: number;
  pValue: number;
  significant: boolean;
  interpretation: string;
}

export function performTTest(
  sample: number[],
  populationMean: number,
  alpha: number = 0.05
): HypothesisTest {
  const n = sample.length;
  const sampleMean = sample.reduce((a, b) => a + b, 0) / n;
  const sampleStdDev = Math.sqrt(
    sample.reduce((acc, val) => acc + Math.pow(val - sampleMean, 2), 0) / (n - 1)
  );
  
  const standardError = sampleStdDev / Math.sqrt(n);
  const tStatistic = (sampleMean - populationMean) / standardError;
  
  // Simplified p-value calculation
  const pValue = 2 * (1 - Math.exp(-Math.abs(tStatistic) / 2));
  
  return {
    testName: 'One-sample t-test',
    statistic: tStatistic,
    pValue,
    significant: pValue < alpha,
    interpretation: pValue < alpha 
      ? 'Reject null hypothesis'
      : 'Fail to reject null hypothesis'
  };
}

export function testNormality(values: number[]): HypothesisTest {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const stdDev = Math.sqrt(
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1)
  );
  
  // Calculate skewness and kurtosis
  const skewness = calculateSkewness(values, mean, stdDev);
  const kurtosis = calculateKurtosis(values, mean, stdDev);
  
  // Jarque-Bera test statistic
  const jbStatistic = (n / 6) * (Math.pow(skewness, 2) + Math.pow(kurtosis, 2) / 4);
  const pValue = 1 - Math.exp(-jbStatistic / 2);
  
  return {
    testName: 'Normality test (Jarque-Bera)',
    statistic: jbStatistic,
    pValue,
    significant: pValue < 0.05,
    interpretation: pValue < 0.05
      ? 'Data is not normally distributed'
      : 'Data appears to be normally distributed'
  };
}

function calculateSkewness(values: number[], mean: number, stdDev: number): number {
  const n = values.length;
  return values.reduce((acc, val) => 
    acc + Math.pow((val - mean) / stdDev, 3), 0) / n;
}

function calculateKurtosis(values: number[], mean: number, stdDev: number): number {
  const n = values.length;
  return values.reduce((acc, val) => 
    acc + Math.pow((val - mean) / stdDev, 4), 0) / n;
}