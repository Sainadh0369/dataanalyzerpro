import { Pipeline, PipelineStage } from '../../types';
import { createError } from '../error';

interface ExecutionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metrics?: {
    startTime: number;
    endTime: number;
    duration: number;
    memoryUsage: number;
  };
}

export class PipelineExecutor {
  private pipeline: Pipeline;
  private onProgress?: (progress: number) => void;
  private abortController: AbortController;
  private metrics: Map<string, number>;

  constructor(stages: PipelineStage[], onProgress?: (progress: number) => void) {
    this.pipeline = {
      stages,
      currentStage: 0,
      isComplete: false
    };
    this.onProgress = onProgress;
    this.abortController = new AbortController();
    this.metrics = new Map();
  }

  async executeStage<T>(
    executor: () => Promise<T>,
    stageName: string
  ): Promise<ExecutionResult<T>> {
    const stage = this.pipeline.stages.find(s => s.name === stageName);
    if (!stage) {
      throw createError('PIPELINE_ERROR', `Stage ${stageName} not found`);
    }

    try {
      const startTime = performance.now();
      const startMemory = 'memory' in performance ? (performance as any).memory?.usedJSHeapSize : 0;

      stage.status = 'processing';
      const result = await Promise.race([
        executor(),
        new Promise((_, reject) => {
          this.abortController.signal.addEventListener('abort', () => {
            reject(new Error('Pipeline execution aborted'));
          });
        })
      ]);

      const endTime = performance.now();
      const endMemory = 'memory' in performance ? (performance as any).memory?.usedJSHeapSize : 0;

      stage.status = 'completed';
      this.updateProgress();
      
      // Store metrics
      this.metrics.set(`${stageName}_duration`, endTime - startTime);
      this.metrics.set(`${stageName}_memory`, endMemory - startMemory);
      
      return {
        success: true,
        data: result,
        metrics: {
          startTime,
          endTime,
          duration: endTime - startTime,
          memoryUsage: endMemory - startMemory
        }
      };
    } catch (error) {
      stage.status = 'error';
      stage.error = error instanceof Error ? error.message : 'Stage execution failed';
      return {
        success: false,
        error: stage.error
      };
    }
  }

  abort(): void {
    this.abortController.abort();
  }

  reset(): void {
    this.pipeline.stages.forEach(stage => {
      stage.status = 'pending';
      stage.error = undefined;
    });
    this.pipeline.currentStage = 0;
    this.pipeline.isComplete = false;
    this.abortController = new AbortController();
    this.metrics.clear();
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
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

  getStageMetrics(stageName: string): { duration: number; memoryUsage: number } | null {
    const duration = this.metrics.get(`${stageName}_duration`);
    const memoryUsage = this.metrics.get(`${stageName}_memory`);
    
    if (duration === undefined || memoryUsage === undefined) {
      return null;
    }

    return { duration, memoryUsage };
  }
}