export function calculateLinearRegression(
  x: number[],
  y: number[]
): { slope: number; intercept: number; rSquared: number } {
  const n = Math.min(x.length, y.length);
  
  // Calculate means
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  // Calculate coefficients
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - meanX;
    numerator += xDiff * (y[i] - meanY);
    denominator += xDiff * xDiff;
  }
  
  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;
  
  // Calculate R-squared
  const predictions = x.map(x => slope * x + intercept);
  const residualSS = y.reduce((acc, yi, i) => acc + Math.pow(yi - predictions[i], 2), 0);
  const totalSS = y.reduce((acc, yi) => acc + Math.pow(yi - meanY, 2), 0);
  const rSquared = 1 - (residualSS / totalSS);
  
  return { slope, intercept, rSquared };
}