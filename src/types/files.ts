export interface FileData {
  type: 'csv' | 'excel' | 'pdf' | 'word';
  content: any;
  name: string;
}

export interface ParsedData {
  headers: string[];
  rows: any[][];
  summary: {
    totalRows: number;
    totalColumns: number;
    dataTypes: Record<string, string>;
  };
}

export interface FileProcessingError {
  message: string;
  code: string;
  fileName?: string;
}