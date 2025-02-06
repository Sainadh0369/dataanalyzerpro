import { DataField } from '@/types/data';
import { calculateMean, calculateStandardDeviation } from './calculations';

export interface HypothesisTest {
  name: string;
  statistic: number;
  pValue: number;
  criticalValue: number;
  significant: boolean;
  alpha: number;
  power: number;
  effectSize: number;
  interpretation: string;
}

export function performHypothesisTests(field: DataField, alpha: number = 0.05): HypothesisTest[] {
  const values = field.value as number[];
  const tests: HypothesisTest[] = [];

  // One-sample t-test
  const mean = calculateMean(values);
  const stdDev = calculateStandardDeviation(values);
  const n = values.length;
  const standardError = stdDev / Math.sqrt(n);
  
  // Test if mean is significantly different from 0
  const tStatistic = mean / standardError;
  const degreesOfFreedom = n - 1;
  const criticalValue = getTCriticalValue(degreesOfFreedom, alpha);
  const pValue = 2 * (1 - studentT(Math.abs(tStatistic), degreesOfFreedom));
  const significant = Math.abs(tStatistic) > criticalValue;
  const effectSize = Math.abs(tStatistic) / Math.sqrt(n);
  const power = calculatePower(effectSize, n, alpha);

  tests.push({
    name: 'One-Sample t-Test',
    statistic: tStatistic,
    pValue,
    criticalValue,
    significant,
    alpha,
    power,
    effectSize,
    interpretation: significant
      ? `The mean is significantly different from 0 (p = ${pValue.toFixed(4)})`
      : `No significant difference from 0 (p = ${pValue.toFixed(4)})`
  });

  // Normality test (Shapiro-Wilk approximation)
  const { statistic: wStatistic, pValue: wPValue } = shapiroWilkTest(values);
  const normalitySignificant = wPValue < alpha;

  tests.push({
    name: 'Normality Test',
    statistic: wStatistic,
    pValue: wPValue,
    criticalValue: 0.95, // Standard critical value for Shapiro-Wilk
    significant: normalitySignificant,
    alpha,
    power: calculatePower(wStatistic, n, alpha),
    effectSize: wStatistic,
    interpretation: normalitySignificant
      ? 'Data significantly deviates from normal distribution'
      : 'Data appears to follow a normal distribution'
  });

  return tests;
}

function studentT(t: number, df: number): number {
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
}

function incompleteBeta(x: number, a: number, b: number): number {
  if (x === 0) return 0;
  if (x === 1) return 1;
  
  const bt = Math.exp(
    gammaLn(a + b) - gammaLn(a) - gammaLn(b) +
    a * Math.log(x) + b * Math.log(1 - x)
  );
  
  return x < (a + 1) / (a + b + 2)
    ? bt * betaContinuedFraction(x, a, b) / a
    : 1 - bt * betaContinuedFraction(1 - x, b, a) / b;
}

function gammaLn(x: number): number {
  const p = [
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  
  let y = x;
  let sum = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) {
    sum += p[i] / (y + i);
  }
  
  const t = y + p.length - 0.5;
  return Math.log(2.5066282746310005 * sum) + (y + 0.5) * Math.log(t) - t;
}

function betaContinuedFraction(x: number, a: number, b: number): number {
  const maxIterations = 200;
  const eps = 3e-7;
  
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  
  let h = 1;
  let lastH = 0;
  
  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m;
    
    const aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    const bb = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    
    const nextH = h * (1 + aa) * (1 + bb);
    
    if (Math.abs(nextH - lastH) < eps) {
      break;
    }
    
    lastH = h;
    h = nextH;
  }
  
  return h;
}

function getTCriticalValue(df: number, alpha: number): number {
  const a = 1 - alpha / 2;
  if (df === 1) return Math.tan(Math.PI * (a - 0.5));
  if (df === 2) return Math.sqrt(2 / (a * (2 - a)) - 2);
  const h = 2 / (1 / (df - 0.5) + 1 / (df - 1.5));
  const w = Math.sqrt(h * a * (1 - a));
  return w * (1 - (h - w * w) * (a - 1/3) / (4 * h));
}

function calculatePower(effectSize: number, n: number, alpha: number): number {
  const ncp = effectSize * Math.sqrt(n);
  const criticalValue = getTCriticalValue(n - 1, alpha);
  return 1 - studentT(criticalValue - ncp, n - 1);
}

function shapiroWilkTest(values: number[]): { statistic: number; pValue: number } {
  const n = values.length;
  if (n < 3) return { statistic: 1, pValue: 1 };

  // Sort values
  const sorted = [...values].sort((a, b) => a - b);
  
  // Calculate mean and variance
  const mean = calculateMean(sorted);
  const variance = calculateStandardDeviation(sorted) ** 2;
  
  // Calculate a coefficients
  const m = n % 2 === 0 ? n / 2 : (n - 1) / 2;
  const a: number[] = [];
  
  for (let i = 0; i < m; i++) {
    const score = normalScore(i + 1, n);
    a.push(score);
  }
  
  // Calculate W statistic
  let w = 0;
  let s2 = 0;
  
  for (let i = 0; i < n; i++) {
    s2 += (sorted[i] - mean) ** 2;
  }
  
  let b = 0;
  for (let i = 0; i < m; i++) {
    b += a[i] * (sorted[n - 1 - i] - sorted[i]);
  }
  
  w = (b * b) / s2;
  
  // Approximate p-value
  const mu = -1.5861 / Math.sqrt(n);
  const sigma = 0.1239 / Math.sqrt(n);
  const z = (Math.log(1 - w) - mu) / sigma;
  const pValue = 1 - normalCDF(z);

  return { statistic: w, pValue };
}

function normalScore(i: number, n: number): number {
  const phi = (i - 0.375) / (n + 0.25);
  return normalQuantile(phi);
}

function normalQuantile(p: number): number {
  const a = [
    -3.969683028665376e+01,
    2.209460984245205e+02,
    -2.759285104469687e+02,
    1.383577518672690e+02,
    -3.066479806614716e+01,
    2.506628277459239e+00
  ];
  
  const b = [
    -5.447609879822406e+01,
    1.615858368580409e+02,
    -1.556989798598866e+02,
    6.680131188771972e+01,
    -1.328068155288572e+01
  ];
  
  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
    4.374664141464968e+00,
    2.938163982698783e+00
  ];
  
  const d = [
    7.784695709041462e-03,
    3.224671290700398e-01,
    2.445134137142996e+00,
    3.754408661907416e+00
  ];
  
  const q = p - 0.5;
  
  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return q * (((((a[5] * r + a[4]) * r + a[3]) * r + a[2]) * r + a[1]) * r + a[0]) /
           (((((b[4] * r + b[3]) * r + b[2]) * r + b[1]) * r + b[0]) * r + 1);
  }
  
  const r = Math.sqrt(-Math.log(p < 0.5 ? p : 1 - p));
  let x = (((((c[5] * r + c[4]) * r + c[3]) * r + c[2]) * r + c[1]) * r + c[0]) /
          ((((d[3] * r + d[2]) * r + d[1]) * r + d[0]) * r + 1);
  
  return p < 0.5 ? -x : x;
}

function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function erf(x: number): number {
  const t = 1 / (1 + 0.5 * Math.abs(x));
  const tau = t * Math.exp(
    -x * x +
    ((((((((0.17087277 * t - 0.82215223) * t + 1.48851587) * t -
    1.13520398) * t + 0.27886807) * t - 0.18628806) * t +
    0.09678418) * t + 0.37409196) * t + 1.00002368) * t -
    1.26551223
  );
  return x >= 0 ? 1 - tau : tau - 1;
}