import { DataField } from '@/types/data';
import { calculateFieldStats } from '../statistics';

export class AIAnalyzer {
  private fields: DataField[];

  constructor(fields: DataField[]) {
    this.fields = fields;
  }

  async analyze() {
    const numericFields = this.fields.filter(f => f.type === 'number');
    const textFields = this.fields.filter(f => f.type === 'string');

    const analysis = {
      statistics: this.analyzeStatistics(numericFields),
      patterns: this.identifyPatterns(numericFields),
      correlations: this.analyzeCorrelations(numericFields),
      textInsights: textFields.length > 0 ? this.analyzeText(textFields) : null,
      recommendations: this.generateRecommendations()
    };

    return analysis;
  }

  private analyzeStatistics(fields: DataField[]) {
    return fields.map(field => {
      const stats = calculateFieldStats(field);
      return {
        field: field.name,
        summary: `${field.name} shows a ${stats.trend} trend with an average of ${stats.mean.toFixed(2)}`,
        significance: this.assessStatisticalSignificance(stats)
      };
    });
  }

  private identifyPatterns(fields: DataField[]) {
    return fields.map(field => {
      const values = field.value as number[];
      const patterns = [];

      // Detect seasonality
      const seasonality = this.detectSeasonality(values);
      if (seasonality) patterns.push(seasonality);

      // Detect outliers
      const outliers = this.detectOutliers(values);
      if (outliers.length > 0) {
        patterns.push(`Found ${outliers.length} outliers in ${field.name}`);
      }

      // Detect cycles
      const cycles = this.detectCycles(values);
      if (cycles) patterns.push(cycles);

      return {
        field: field.name,
        patterns
      };
    });
  }

  private analyzeCorrelations(fields: DataField[]) {
    const correlations = [];
    
    for (let i = 0; i < fields.length; i++) {
      for (let j = i + 1; j < fields.length; j++) {
        const correlation = this.calculateCorrelation(
          fields[i].value as number[],
          fields[j].value as number[]
        );
        
        if (Math.abs(correlation) > 0.5) {
          correlations.push({
            fields: [fields[i].name, fields[j].name],
            strength: correlation,
            interpretation: this.interpretCorrelation(correlation)
          });
        }
      }
    }

    return correlations;
  }

  private analyzeText(fields: DataField[]) {
    return fields.map(field => {
      const values = field.value as string[];
      const uniqueValues = new Set(values);
      
      return {
        field: field.name,
        uniqueCount: uniqueValues.size,
        commonPatterns: this.findCommonPatterns(values),
        categorization: this.categorizeText(values)
      };
    });
  }

  private generateRecommendations() {
    const recommendations = [];
    const stats = this.fields.map(f => calculateFieldStats(f));

    // Identify fields needing attention
    stats.forEach((stat, i) => {
      if (stat.trend === 'down') {
        recommendations.push(`Investigate declining trend in ${this.fields[i].name}`);
      }
      
      const cv = stat.stdDev / stat.mean;
      if (cv > 0.3) {
        recommendations.push(`High variability detected in ${this.fields[i].name} - consider stabilization measures`);
      }
    });

    return recommendations;
  }

  // Helper methods
  private calculateCorrelation(x: number[], y: number[]): number {
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

  private interpretCorrelation(correlation: number): string {
    const strength = Math.abs(correlation);
    const direction = correlation > 0 ? 'positive' : 'negative';
    
    if (strength > 0.8) return `Strong ${direction} relationship`;
    if (strength > 0.5) return `Moderate ${direction} relationship`;
    return `Weak ${direction} relationship`;
  }

  private detectSeasonality(values: number[]): string | null {
    // Simple seasonality detection using autocorrelation
    const n = values.length;
    if (n < 4) return null;

    const diffs = values.slice(1).map((v, i) => v - values[i]);
    const patterns = diffs.reduce((acc, diff) => {
      const key = Math.sign(diff);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const total = Object.values(patterns).reduce((a, b) => a + b, 0);
    const maxPattern = Math.max(...Object.values(patterns));
    
    if (maxPattern / total > 0.7) {
      return 'Seasonal pattern detected';
    }
    return null;
  }

  private detectOutliers(values: number[]): number[] {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    );
    
    return values.filter(v => Math.abs(v - mean) > 2 * stdDev);
  }

  private detectCycles(values: number[]): string | null {
    // Simple cycle detection
    const n = values.length;
    if (n < 6) return null;

    const peaks = [];
    for (let i = 1; i < n - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        peaks.push(i);
      }
    }

    if (peaks.length >= 2) {
      const avgCycleLength = (peaks[peaks.length - 1] - peaks[0]) / (peaks.length - 1);
      return `Cyclic pattern detected with average length of ${avgCycleLength.toFixed(1)} points`;
    }
    return null;
  }

  private findCommonPatterns(values: string[]): string[] {
    const patterns = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(patterns)
      .filter(([_, count]) => count > values.length * 0.1)
      .map(([pattern, count]) => 
        `Pattern "${pattern}" appears ${count} times (${((count / values.length) * 100).toFixed(1)}%)`
      );
  }

  private categorizeText(values: string[]): string[] {
    const categories = new Set(values.map(this.inferCategory));
    return Array.from(categories);
  }

  private inferCategory(text: string): string {
    // Simple category inference based on common patterns
    if (/^\d+$/.test(text)) return 'Numeric ID';
    if (/@/.test(text)) return 'Email';
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return 'Date';
    if (/^[A-Z0-9\s\-]+$/.test(text)) return 'Code';
    return 'General Text';
  }

  private assessStatisticalSignificance(stats: any) {
    const cv = stats.stdDev / stats.mean;
    if (cv < 0.1) return 'High confidence';
    if (cv < 0.3) return 'Moderate confidence';
    return 'Low confidence';
  }
}