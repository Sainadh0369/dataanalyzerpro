import { DataField } from '../../../types';
import { PipelineExecutor } from '../../core/pipeline/executor';
import { PIPELINE_STAGES } from '../../core/pipeline/stages';
import { validateDataset } from '../../validation/dataValidation';
import { preprocessData } from '../preprocessing';
import { performStatisticalAnalysis } from '../statistics';
import { performMLAnalysis } from '../../ml/core';
import { performNLPAnalysis } from '../../nlp/core';
import { performPredictiveAnalysis } from '../../predictive/core';
import { generateInsights } from '../insights';

export class DataAnalyzer {
  private executor: PipelineExecutor;
  private fields: DataField[];

  constructor(fields: DataField[], onProgress?: (progress: number) => void) {
    this.executor = new PipelineExecutor(PIPELINE_STAGES, onProgress);
    this.fields = fields;
  }

  async analyze() {
    try {
      // Data Validation
      await this.executor.executeStage(
        async () => {
          const validation = validateDataset(this.fields);
          if (!validation.isValid) {
            throw new Error(validation.error);
          }
          return validation;
        },
        'Data Validation'
      );

      // Data Preprocessing
      const processedData = await this.executor.executeStage(
        async () => preprocessData(this.fields),
        'Data Preprocessing'
      );

      // Run analyses in parallel
      const [
        statisticalResults,
        mlResults,
        nlpResults,
        predictiveResults
      ] = await Promise.all([
        this.executor.executeStage(
          async () => performStatisticalAnalysis(processedData),
          'Statistical Analysis'
        ),
        this.executor.executeStage(
          async () => performMLAnalysis(processedData),
          'Machine Learning'
        ),
        this.executor.executeStage(
          async () => performNLPAnalysis(processedData),
          'Text Analysis'
        ),
        this.executor.executeStage(
          async () => performPredictiveAnalysis(processedData),
          'Predictive Analysis'
        )
      ]);

      // Generate insights
      const insights = await this.executor.executeStage(
        async () => generateInsights({
          statistical: statisticalResults,
          ml: mlResults,
          nlp: nlpResults,
          predictive: predictiveResults
        }),
        'Insights Generation'
      );

      return {
        statistics: statisticalResults,
        mlAnalysis: mlResults,
        nlpAnalysis: nlpResults,
        predictiveAnalysis: predictiveResults,
        insights,
        pipeline: this.executor.getPipeline()
      };
    } catch (error) {
      console.error('Analysis pipeline error:', error);
      throw error;
    }
  }

  getPipeline() {
    return this.executor.getPipeline();
  }
}