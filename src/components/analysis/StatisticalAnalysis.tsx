import React from 'react';
import { DataField } from '../../types';
import { StatisticalSummary } from './StatisticalSummary';

interface StatisticalAnalysisProps {
  data: {
    fields: DataField[];
  };
}

export function StatisticalAnalysis({ data }: StatisticalAnalysisProps) {
  return <StatisticalSummary data={data} />;
}