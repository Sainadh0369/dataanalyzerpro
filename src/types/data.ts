export interface DataField {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  value: any[];
  metadata?: {
    total?: number;
    average?: number;
    min?: number;
    max?: number;
    sampleSize?: number;
  };
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
  hasNumericData: boolean;
  hasTextData: boolean;
  dataQuality: {
    completeness: number;
    validity: number;
  };
}