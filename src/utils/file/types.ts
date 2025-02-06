import type { DataField } from '../../types';

export interface FileData {
  type: 'csv';
  content: {
    fields: DataField[];
  };
  name: string;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
}