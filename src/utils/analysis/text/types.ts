export interface TextAnalysisResult {
  totalCount: number;
  uniqueCount: number;
  averageLength: number;
}

export interface TextFieldAnalysis {
  field: string;
  analysis: TextAnalysisResult;
}