import { PipelineStage } from '../types';
import { validateDataset } from '../validation/dataValidation';
import { performMLAnalysis } from '../ml/core';
import { performNLPAnalysis } from '../nlp/core';
import { performPredictiveAnalysis } from '../predictive/core';
import { DataField } from '../types';

export const ANALYSIS_STAGES: PipelineStage[] = [
  { name: 'Data Validation', status: 'pending' },
  { name: 'ML Analysis', status: 'pending' },
  { name: 'NLP Analysis', status: 'pending' },
  { name: 'Predictive Analysis', status: 'pending' }
];

export function createAnalysisStages(fields: DataField[]) {
  return [
    async () => {
      const validation = validateDataset(fields);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      return fields;
    },
    async () => performMLAnalysis(fields),
    async () => performNLPAnalysis(fields),
    async () => performPredictiveAnalysis(fields)
  ];
}