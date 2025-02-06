import { DataField } from '@/types/data';
import { calculateFieldStats } from './statistics';

export class DataInterpreter {
  static interpretTrends(field: DataField) {
    const stats = calculateFieldStats(field);
    const interpretation = {
      trend: stats.trend,
      strength: 'moderate',
      confidence: 'medium',
      insights: [] as string[]
    };

    // Analyze trend strength
    const values = field.value as number[];
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const percentChange = ((secondMean - firstMean) / firstMean) * 100;

    // Interpret trend strength
    if (Math.abs(percentChange) > 20) {
      interpretation.strength = 'strong';
      interpretation.insights.push(
        `${field.name} shows a strong ${percentChange > 0 ? 'increase' : 'decrease'} ` +
        `of ${Math.abs(percentChange).toFixed(1)}%`
      );
    } else if (Math.abs(percentChange) > 5) {
      interpretation.strength = 'moderate';
      interpretation.insights.push(
        `${field.name} shows a moderate ${percentChange > 0 ? 'increase' : 'decrease'} ` +
        `of ${Math.abs(percentChange).toFixed(1)}%`
      );
    } else {
      interpretation.strength = 'weak';
      interpretation.insights.push(
        `${field.name} remains relatively stable with a change of ${Math.abs(percentChange).toFixed(1)}%`
      );
    }

    // Analyze consistency
    const cv = stats.stdDev / stats.mean;
    if (cv < 0.1) {
      interpretation.confidence = 'high';
      interpretation.insights.push(`Data shows high consistency with low variability`);
    } else if (cv > 0.3) {
      interpretation.confidence = 'low';
      interpretation.insights.push(`Data shows significant variability, interpret with caution`);
    }

    // Detect patterns
    const patterns = this.detectPatterns(values);
    interpretation.insights.push(...patterns);

    return interpretation;
  }

  static interpretCorrelations(fields: DataField[]) {
    const correlations = [];
    const numericFields = fields.filter(f => f.type === 'number');

    for (let i = 0; i < numericFields.length; i++) {
      for (let j = i + 1; j < numericFields.length; j++) {
        const correlation = this.calculateCorrelation(
          numericFields[i].value as number[],
          numericFields[j].value as number[]
        );

        if (Math.abs(correlation) > 0.3) {
          correlations.push({
            fields: [numericFields[i].name, numericFields[j].name],
            correlation,
            interpretation: this.interpretCorrelationStrength(correlation)
          });
        }
      }
    }

    return correlations;
  }

  private static detectPatterns(values: number[]): string[] {
    const patterns = [];

    // Detect seasonality
    const seasonality = this.detectSeasonality(values);
    if (seasonality) patterns.push(seasonality);

    // Detect cycles
    const cycles = this.detectCycles(values);
    if (cycles) patterns.push(cycles);

    // Detect outliers
    const outliers = this.detectOutliers(values);
    if (outliers.length > 0) {
      patterns.push(`Found ${outliers.length} unusual values that may require attention`);
    }

    return patterns;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
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

  private static interpretCorrelationStrength(correlation: number): string {
    const strength = Math.abs(correlation);
    const direction = correlation > 0 ? 'positive' : 'negative';
    
    if (strength > 0.7) {
      return `Strong ${direction} relationship - changes in one variable are strongly associated with changes in the other`;
    }
    if (strength > 0.5) {
      return `Moderate ${direction} relationship - there is a noticeable pattern of association`;
    }
    return `Weak ${direction} relationship - variables show some association but the pattern is not strong`;
  }

  private static detectSeasonality(values: number[]): string | null {
    const n = values.length;
    if (n < 4) return null;

    // Calculate differences between consecutive values
    const diffs = values.slice(1).map((v, i) => v - values[i]);
    
    // Look for repeating patterns in differences
    const patternLength = this.findPatternLength(diffs);
    
    if (patternLength > 1 && patternLength < n / 2) {
      return `Seasonal pattern detected with approximate cycle length of ${patternLength} points`;
    }
    
    return null;
  }

  private static findPatternLength(values: number[]): number {
    const n = values.length;
    let bestLength = 1;
    let bestCorrelation = 0;

    // Try different pattern lengths
    for (let length = 2; length <= Math.min(10, n / 2); length++) {
      const segments = Math.floor(n / length);
      let totalCorrelation = 0;
      let correlationCount = 0;

      // Compare segments
      for (let i = 0; i < segments - 1; i++) {
        for (let j = i + 1; j < segments; j++) {
          const seg1 = values.slice(i * length, (i + 1) * length);
          const seg2 = values.slice(j * length, (j + 1) * length);
          const correlation = Math.abs(this.calculateCorrelation(seg1, seg2));
          totalCorrelation += correlation;
          correlationCount++;
        }
      }

      const avgCorrelation = totalCorrelation / correlationCount;
      if (avgCorrelation > bestCorrelation) {
        bestCorrelation = avgCorrelation;
        bestLength = length;
      }
    }

    return bestLength;
  }

  private static detectCycles(values: number[]): string | null {
    const n = values.length;
    if (n < 6) return null;

    // Find peaks
    const peaks = [];
    for (let i = 1; i < n - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        peaks.push(i);
      }
    }

    if (peaks.length >= 2) {
      const intervals = peaks.slice(1).map((peak, i) => peak - peaks[i]);
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      
      // Check if intervals are consistent
      const intervalVariation = Math.sqrt(
        intervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) / intervals.length
      ) / avgInterval;

      if (intervalVariation < 0.2) {
        return `Regular cyclic pattern detected with period of approximately ${avgInterval.toFixed(1)} points`;
      }
    }
    
    return null;
  }

  private static detectOutliers(values: number[]): number[] {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    );
    
    return values.filter(v => Math.abs(v - mean) > 2 * stdDev);
  }
}