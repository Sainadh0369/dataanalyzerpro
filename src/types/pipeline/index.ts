export interface PipelineStage {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface Pipeline {
  stages: PipelineStage[];
  currentStage: number;
  isComplete: boolean;
  error?: string;
}

export interface PipelineResult {
  success: boolean;
  data?: any;
  error?: string;
}