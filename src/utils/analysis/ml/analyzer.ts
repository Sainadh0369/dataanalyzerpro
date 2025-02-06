import { DataField } from '@/types/data';
import { calculateMean, calculateStandardDeviation } from '../statistics/calculations';

interface MLAnalysisResult {
  field: string;
  predictions: number[];
  confidence: number;
  features: string[];
  patterns: {
    type: string;
    description: string;
    confidence: number;
  }[];
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export class MLAnalyzer {
  private fields: DataField[];

  constructor(fields: DataField[]) {
    this.fields = fields;
  }

  async analyze(): Promise<MLAnalysisResult[]> {
    const numericFields = this.fields.filter(f => f.type === 'number');
    if (numericFields.length < 2) {
      throw new Error('At least two numeric fields are required for ML analysis');
    }

    return numericFields.map(field => this.analyzeField(field, numericFields));
  }

  private analyzeField(field: DataField, allFields: DataField[]): MLAnalysisResult {
    const values = field.value as number[];
    const otherFields = allFields.filter(f => f !== field);
    
    // Feature selection
    const selectedFeatures = this.selectFeatures(field, otherFields);
    
    // Pattern detection
    const patterns = this.detectPatterns(values);
    
    // Generate predictions
    const predictions = this.generatePredictions(field, selectedFeatures);
    
    // Calculate confidence and metrics
    const confidence = this.calculateConfidence(predictions, values);
    const metrics = this.calculateMetrics(predictions, values);

    return {
      field: field.name,
      predictions,
      confidence,
      features: selectedFeatures.map(f => f.name),
      patterns,
      metrics
    };
  }

  private selectFeatures(target: DataField, candidates: DataField[]): DataField[] {
    return candidates
      .map(field => ({
        field,
        correlation: this.calculateCorrelation(
          target.value as number[],
          field.value as number[]
        )
      }))
      .filter(({ correlation }) => Math.abs(correlation) > 0.3)
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 3)
      .map(({ field }) => field);
  }

  private detectPatterns(values: number[]): {
    type: string;
    description: string;
    confidence: number;
  }[] {
    const patterns = [];
    
    // Trend detection
    const trend = this.detectTrend(values);
    if (trend) {
      patterns.push({
        type: 'trend',
        description: `${trend.direction} trend detected`,
        confidence: trend.confidence
      });
    }
    
    // Seasonality detection
    const seasonality = this.detectSeasonality(values);
    if (seasonality) {
      patterns.push({
        type: 'seasonality',
        description: `Seasonal pattern with period ${seasonality.period}`,
        confidence: seasonality.confidence
      });
    }
    
    // Outlier detection
    const outliers = this.detectOutliers(values);
    if (outliers.length > 0) {
      patterns.push({
        type: 'outliers',
        description: `${outliers.length} outliers detected`,
        confidence: 0.9
      });
    }
    
    // Clustering patterns
    const clusters = this.detectClusters(values);
    if (clusters.length > 0) {
      patterns.push({
        type: 'clusters',
        description: `${clusters.length} distinct clusters identified`,
        confidence: 0.85
      });
    }

    return patterns;
  }

  private generatePredictions(
    target: DataField,
    features: DataField[]
  ): number[] {
    const values = target.value as number[];
    const n = values.length;
    const predictions: number[] = new Array(n);
    
    // Simple ensemble of models
    const models = [
      this.linearModel.bind(this),
      this.movingAverageModel.bind(this),
      this.weightedAverageModel.bind(this)
    ];
    
    // Generate predictions from each model
    const modelPredictions = models.map(model => 
      model(target, features)
    );
    
    // Ensemble the predictions
    for (let i = 0; i < n; i++) {
      predictions[i] = modelPredictions.reduce(
        (sum, pred) => sum + pred[i],
        0
      ) / models.length;
    }
    
    return predictions;
  }

  private linearModel(target: DataField, features: DataField[]): number[] {
    const y = target.value as number[];
    const X = features.map(f => f.value as number[]);
    const n = y.length;
    
    // Simple linear regression
    const predictions = new Array(n);
    const meanY = calculateMean(y);
    const meanX = X.map(x => calculateMean(x));
    
    for (let i = 0; i < n; i++) {
      let pred = meanY;
      for (let j = 0; j < X.length; j++) {
        const beta = this.calculateCorrelation(y, X[j]);
        pred += beta * (X[j][i] - meanX[j]);
      }
      predictions[i] = pred;
    }
    
    return predictions;
  }

  private movingAverageModel(target: DataField): number[] {
    const values = target.value as number[];
    const window = Math.min(5, Math.floor(values.length / 4));
    return values.map((_, i) => {
      const start = Math.max(0, i - window);
      const end = i + 1;
      return calculateMean(values.slice(start, end));
    });
  }

  private weightedAverageModel(
    target: DataField,
    features: DataField[]
  ): number[] {
    const y = target.value as number[];
    const X = features.map(f => f.value as number[]);
    const n = y.length;
    
    // Calculate weights based on correlations
    const weights = X.map(x => 
      Math.abs(this.calculateCorrelation(y, x))
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    // Normalize weights
    const normalizedWeights = weights.map(w => 
      totalWeight > 0 ? w / totalWeight : 1 / weights.length
    );
    
    // Generate predictions
    return Array(n).fill(0).map((_, i) => {
      return X.reduce((pred, x, j) => 
        pred + normalizedWeights[j] * x[i],
        0
      );
    });
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    const meanX = calculateMean(x);
    const meanY = calculateMean(y);
    const stdX = calculateStandardDeviation(x);
    const stdY = calculateStandardDeviation(y);
    
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (x[i] - meanX) * (y[i] - meanY);
    }
    
    return sum / (n * stdX * stdY);
  }

  private calculateConfidence(
    predictions: number[],
    actual: number[]
  ): number {
    const errors = predictions.map((p, i) => 
      Math.abs(p - actual[i]) / Math.abs(actual[i])
    );
    const meanError = calculateMean(errors);
    return Math.max(0, 1 - meanError);
  }

  private calculateMetrics(
    predictions: number[],
    actual: number[]
  ) {
    const n = predictions.length;
    let tp = 0, fp = 0, fn = 0;
    
    // Calculate metrics using relative change direction
    for (let i = 1; i < n; i++) {
      const actualChange = actual[i] > actual[i-1];
      const predictedChange = predictions[i] > predictions[i-1];
      
      if (actualChange === predictedChange) {
        if (actualChange) tp++;
        else tp++;
      } else {
        if (predictedChange) fp++;
        else fn++;
      }
    }
    
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
    
    return {
      accuracy: tp / (n - 1),
      precision,
      recall,
      f1Score
    };
  }

  private detectTrend(values: number[]): { 
    direction: string; 
    confidence: number; 
  } | null {
    const n = values.length;
    if (n < 4) return null;
    
    const firstHalf = values.slice(0, Math.floor(n/2));
    const secondHalf = values.slice(Math.floor(n/2));
    
    const meanFirst = calculateMean(firstHalf);
    const meanSecond = calculateMean(secondHalf);
    
    const stdFirst = calculateStandardDeviation(firstHalf);
    const stdSecond = calculateStandardDeviation(secondHalf);
    
    const difference = meanSecond - meanFirst;
    const avgStd = (stdFirst + stdSecond) / 2;
    
    if (Math.abs(difference) < avgStd * 0.1) return null;
    
    return {
      direction: difference > 0 ? 'increasing' : 'decreasing',
      confidence: Math.min(1, Math.abs(difference) / avgStd)
    };
  }

  private detectSeasonality(values: number[]): {
    period: number;
    confidence: number;
  } | null {
    const n = values.length;
    if (n < 8) return null;
    
    // Try different periods
    const maxPeriod = Math.floor(n / 2);
    let bestPeriod = 0;
    let bestScore = 0;
    
    for (let period = 2; period <= maxPeriod; period++) {
      let score = 0;
      for (let i = 0; i < n - period; i++) {
        const correlation = this.calculateCorrelation(
          values.slice(i, i + period),
          values.slice(i + period, i + 2 * period)
        );
        score += correlation;
      }
      score /= (n - period);
      
      if (score > bestScore) {
        bestScore = score;
        bestPeriod = period;
      }
    }
    
    if (bestScore < 0.3) return null;
    
    return {
      period: bestPeriod,
      confidence: bestScore
    };
  }

  private detectOutliers(values: number[]): number[] {
    const mean = calculateMean(values);
    const std = calculateStandardDeviation(values);
    const threshold = 2.5;
    
    return values.reduce((outliers, value, index) => {
      if (Math.abs(value - mean) > threshold * std) {
        outliers.push(index);
      }
      return outliers;
    }, [] as number[]);
  }

  private detectClusters(values: number[]): {
    center: number;
    size: number;
  }[] {
    const n = values.length;
    if (n < 10) return [];
    
    // Simple k-means clustering
    const k = Math.min(3, Math.floor(Math.sqrt(n)));
    let centers = values
      .slice()
      .sort((a, b) => a - b)
      .filter((_, i, arr) => i % Math.floor(arr.length / k) === 0)
      .slice(0, k);
    
    const maxIter = 10;
    for (let iter = 0; iter < maxIter; iter++) {
      // Assign points to clusters
      const clusters = Array(k).fill(0).map(() => [] as number[]);
      values.forEach(value => {
        const closest = centers.reduce((best, center, i) => 
          Math.abs(value - center) < Math.abs(value - centers[best]) ? i : best,
          0
        );
        clusters[closest].push(value);
      });
      
      // Update centers
      const newCenters = clusters.map(cluster => 
        cluster.length > 0 ? calculateMean(cluster) : 0
      );
      
      // Check convergence
      const changed = newCenters.some((center, i) => 
        Math.abs(center - centers[i]) > 1e-6
      );
      centers = newCenters;
      
      if (!changed) break;
    }
    
    return centers
      .map((center, i) => ({
        center,
        size: values.filter(v => 
          Math.abs(v - center) <= Math.abs(v - centers.find(c => c !== center)!)
        ).length
      }))
      .filter(cluster => cluster.size > 0);
  }
}