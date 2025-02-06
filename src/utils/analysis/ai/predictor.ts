import { DataField } from '@/types/data';
import { calculateFieldStats } from '../statistics/calculations';
import { determineTrend } from '../statistics/trends';

interface Prediction {
  field: string;
  forecast: number[];
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  seasonality: number | null;
}

interface Recommendation {
  action: string;
  reason: string;
  impact: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  metrics: string[];
}

export class AIPredictor {
  static async generatePredictions(fields: DataField[]): Promise<{
    predictions: Prediction[];
    recommendations: Recommendation[];
  }> {
    const numericFields = fields.filter(f => f.type === 'number');
    const predictions: Prediction[] = [];
    
    // Generate predictions for each numeric field
    for (const field of numericFields) {
      const prediction = await this.predictField(field);
      if (prediction) predictions.push(prediction);
    }

    // Generate recommendations based on predictions
    const recommendations = this.generateRecommendations(predictions, fields);

    return { predictions, recommendations };
  }

  private static async predictField(field: DataField): Promise<Prediction | null> {
    try {
      const values = field.value as number[];
      if (values.length < 4) return null;

      // Detect seasonality
      const seasonality = this.detectSeasonality(values);
      
      // Calculate trend and change
      const trend = determineTrend(values);
      const stats = calculateFieldStats(field);
      const changePercent = ((values[values.length - 1] - values[0]) / values[0]) * 100;

      // Generate forecast using appropriate model
      const forecast = await this.generateForecast(values, seasonality);
      
      // Calculate confidence based on data quality and pattern strength
      const confidence = this.calculatePredictionConfidence(values, forecast);

      return {
        field: field.name,
        forecast,
        confidence,
        trend: trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable',
        changePercent,
        seasonality
      };
    } catch (error) {
      console.error(`Prediction failed for ${field.name}:`, error);
      return null;
    }
  }

  private static async generateForecast(values: number[], seasonality: number | null): Promise<number[]> {
    const forecast: number[] = [];
    const forecastHorizon = 5; // Predict next 5 points

    if (seasonality) {
      // Use seasonal pattern for prediction
      const seasonalPattern = this.calculateSeasonalPattern(values, seasonality);
      const trend = this.calculateTrendComponent(values);
      
      for (let i = 0; i < forecastHorizon; i++) {
        const seasonalIndex = i % seasonality;
        const trendValue = trend.slope * (values.length + i) + trend.intercept;
        forecast.push(trendValue * seasonalPattern[seasonalIndex]);
      }
    } else {
      // Use exponential smoothing
      const alpha = 0.3; // Smoothing factor
      let lastValue = values[values.length - 1];
      let lastTrend = values[values.length - 1] - values[values.length - 2];

      for (let i = 0; i < forecastHorizon; i++) {
        const nextValue = lastValue + lastTrend;
        forecast.push(nextValue);
        lastTrend = alpha * (nextValue - lastValue) + (1 - alpha) * lastTrend;
        lastValue = nextValue;
      }
    }

    return forecast;
  }

  private static detectSeasonality(values: number[]): number | null {
    const n = values.length;
    if (n < 8) return null; // Need enough data points

    // Calculate autocorrelation for different lags
    const maxLag = Math.floor(n / 2);
    let bestLag = null;
    let bestCorrelation = 0;

    for (let lag = 2; lag <= maxLag; lag++) {
      const correlation = this.calculateAutocorrelation(values, lag);
      if (correlation > bestCorrelation && correlation > 0.7) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    return bestLag;
  }

  private static calculateAutocorrelation(values: number[], lag: number): number {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
      denominator += Math.pow(values[i] - mean, 2);
    }

    return numerator / denominator;
  }

  private static calculateSeasonalPattern(values: number[], seasonality: number): number[] {
    const pattern = new Array(seasonality).fill(0);
    const counts = new Array(seasonality).fill(0);
    const detrended = this.removeTrend(values);

    for (let i = 0; i < values.length; i++) {
      const index = i % seasonality;
      pattern[index] += detrended[i];
      counts[index]++;
    }

    return pattern.map((sum, i) => sum / counts[i]);
  }

  private static removeTrend(values: number[]): number[] {
    const trend = this.calculateTrendComponent(values);
    return values.map((v, i) => v / (trend.slope * i + trend.intercept));
  }

  private static calculateTrendComponent(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private static calculatePredictionConfidence(actual: number[], forecast: number[]): number {
    // Calculate MAPE (Mean Absolute Percentage Error)
    const errors = actual.slice(-forecast.length).map((value, i) => 
      Math.abs((value - forecast[i]) / value)
    );
    const mape = errors.reduce((a, b) => a + b, 0) / errors.length;
    
    // Convert MAPE to confidence score (0-1)
    return Math.max(0, Math.min(1, 1 - mape));
  }

  private static generateRecommendations(
    predictions: Prediction[],
    fields: DataField[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Analyze predictions for actionable insights
    predictions.forEach(prediction => {
      if (prediction.confidence < 0.5) return; // Skip low-confidence predictions

      const changeAbs = Math.abs(prediction.changePercent);
      
      if (prediction.trend === 'decreasing' && changeAbs > 10) {
        recommendations.push({
          action: `Address decline in ${prediction.field}`,
          reason: `Projected to decrease by ${changeAbs.toFixed(1)}% based on current trend`,
          impact: 'Potential negative impact on performance metrics',
          confidence: prediction.confidence,
          priority: changeAbs > 20 ? 'high' : 'medium',
          metrics: [prediction.field]
        });
      }

      if (prediction.trend === 'increasing' && changeAbs > 15) {
        recommendations.push({
          action: `Capitalize on growth in ${prediction.field}`,
          reason: `Projected to increase by ${changeAbs.toFixed(1)}%`,
          impact: 'Opportunity for expansion and optimization',
          confidence: prediction.confidence,
          priority: changeAbs > 25 ? 'high' : 'medium',
          metrics: [prediction.field]
        });
      }

      if (prediction.seasonality) {
        recommendations.push({
          action: `Prepare for seasonal changes in ${prediction.field}`,
          reason: `Seasonal pattern detected with ${prediction.seasonality} period cycles`,
          impact: 'Optimize resource allocation based on seasonal patterns',
          confidence: prediction.confidence,
          priority: 'medium',
          metrics: [prediction.field]
        });
      }
    });

    // Cross-field analysis for complex recommendations
    if (predictions.length >= 2) {
      const correlatedFields = this.findCorrelatedMetrics(fields);
      correlatedFields.forEach(({ field1, field2, correlation }) => {
        if (Math.abs(correlation) > 0.7) {
          recommendations.push({
            action: `Consider relationship between ${field1} and ${field2}`,
            reason: `Strong ${correlation > 0 ? 'positive' : 'negative'} correlation detected`,
            impact: 'Opportunity for optimization through metric relationships',
            confidence: Math.abs(correlation),
            priority: Math.abs(correlation) > 0.9 ? 'high' : 'medium',
            metrics: [field1, field2]
          });
        }
      });
    }

    return recommendations;
  }

  private static findCorrelatedMetrics(fields: DataField[]): Array<{
    field1: string;
    field2: string;
    correlation: number;
  }> {
    const correlations: Array<{
      field1: string;
      field2: string;
      correlation: number;
    }> = [];

    const numericFields = fields.filter(f => f.type === 'number');
    
    for (let i = 0; i < numericFields.length; i++) {
      for (let j = i + 1; j < numericFields.length; j++) {
        const correlation = this.calculateCorrelation(
          numericFields[i].value as number[],
          numericFields[j].value as number[]
        );

        if (Math.abs(correlation) > 0.5) {
          correlations.push({
            field1: numericFields[i].name,
            field2: numericFields[j].name,
            correlation
          });
        }
      }
    }

    return correlations;
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
}