import { Pipeline, PipelineStage } from '../types';
import { createError } from './error';

export class PipelineManager {
  private pipeline: Pipeline;

  constructor(stages: PipelineStage[]) {
    this.pipeline = {
      stages,
      currentStage: 0,
      isComplete: false
    };
  }

  getCurrentStage(): PipelineStage {
    return this.pipeline.stages[this.pipeline.currentStage];
  }

  updateStage(status: PipelineStage['status'], error?: string) {
    const stage = this.getCurrentStage();
    stage.status = status;
    if (error) stage.error = error;
  }

  async executeStage<T>(
    executor: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T | null> {
    const stage = this.getCurrentStage();
    
    try {
      this.updateStage('processing');
      const result = await executor();
      this.updateStage('completed');
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Stage execution failed';
      this.updateStage('error', errorMessage);
      throw createError('PIPELINE_ERROR', `${stage.name} failed: ${errorMessage}`);
    }
  }

  async execute<T>(
    stages: Array<() => Promise<T>>,
    onComplete?: (results: T[]) => void
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < stages.length; i++) {
      this.pipeline.currentStage = i;
      const result = await this.executeStage(stages[i]);
      if (result) results.push(result);
    }

    this.pipeline.isComplete = true;
    onComplete?.(results);
    return results;
  }

  getPipeline(): Pipeline {
    return this.pipeline;
  }
}