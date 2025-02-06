export interface AnalysisSettings {
  enableML: boolean;
  enableNLP: boolean;
  enablePredictive: boolean;
  enableRegression: boolean;
  enableTimeSeries: boolean;
}

export interface DataField {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  value: any[];
  unit?: string;
}

export interface AnalyzedData {
  fields: DataField[];
  statistics: {
    mean: Record<string, number>;
    median: Record<string, number>;
    standardDeviation: Record<string, number>;
    correlations: Record<string, number>;
  };
  insights: string[];
  mlAnalysis?: {
    predictions: Record<string, number[]>;
    confidence: number;
    features: string[];
  };
  nlpResults?: Array<{
    field: string;
    analysis: {
      sentiment: {
        score: number;
        label: string;
        confidence: number;
      };
      keywords: string[];
      summary: string;
      categories: string[];
    };
  }>;
  predictions?: Array<{
    fieldName: string;
    predictions: number[];
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercentage: number;
  }>;
  regressionResults?: Array<{
    field: string;
    coefficients: number[];
    intercept: number;
    rSquared: number;
    predictions: number[];
    equation: string;
  }>;
  timeSeriesResults?: Array<{
    field: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    seasonality: number | null;
    forecast: number[];
    confidence: number;
    components: {
      trend: number[];
      seasonal: number[];
      residual: number[];
    };
  }>;
  hasNumericData: boolean;
  hasTextData: boolean;
  dataQuality: {
    completeness: number;
    validity: number;
  };
  originalData?: any;
}