import { DataField } from '../../../types';

export interface StatisticalSummaryProps {
  data: {
    fields: DataField[];
  };
}

export interface StatsSummaryProps {
  fields: DataField[];
}

export interface StatRowProps {
  label: string;
  value: string;
}

export interface FieldStatsProps {
  field: DataField;
}