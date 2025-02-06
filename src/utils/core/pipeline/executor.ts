import { Pipeline, PipelineStage } from '../../types';
import { createError } from '../error';

export class PipelineExecutor {
  private pipeline: Pipeline;
  private onProgress?: (progress: number) => void;

  constructor(stages: PipelineStage[], onProgress?: (progress: number) => void) {
    this.pipeline = {
      stages,
      currentStage: 0,
      isComplete: false
    };
    this.onProgress = onProgress;
  }

  async executeStage<T>(
    executor: () => Promise<T>,
    stageName: string
  ): Promise<T> {
    const stage = this.pipeline.stages.find(s => s.name === stageName);
    if (!stage) {
      throw createError('PIPELINE_ERROR', `Stage ${stageName} not found`);
    }

    try {
      stage.status = 'processing';
      const result = await executor();
      stage.status = 'completed';
      
      this.updateProgress();
      return result;
    } catch (error) {
      stage.status = 'error';
      stage.error = error instanceof Error ? error.message : 'Stage execution failed';
      throw error;
    }
  }

  private updateProgress() {
    if (!this.onProgress) return;
    
    const completed = this.pipeline.stages.filter(s => s.status === 'completed').length;
    const total = this.pipeline.stages.length;
    this.onProgress((completed / total) * 100);
  }

  getPipeline(): Pipeline {
    return this.pipeline;
  }

  isComplete(): boolean {
    return this.pipeline.stages.every(s => s.status === 'completed');
  }

  getCurrentStage(): string {
    return this.pipeline.stages[this.pipeline.currentStage].name;
  }
}