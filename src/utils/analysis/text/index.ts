export * from './analysis';
export * from './types';

export interface TextAnalysisResult {
  totalCount: number;
  uniqueCount: number;
  averageLength: number;
}