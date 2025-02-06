import { useState, useCallback } from 'react';
import { FileData, AnalyzedData } from '../../types';
import { analyzeData } from '../../utils/analysis/core';
import { validateFileData } from '../../utils/validation/fileValidation';
import { createError } from '../../utils/core/error';

export function useDataProcessing() {
  const [processedData, setProcessedData] = useState<AnalyzedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (fileData: FileData) => {
    if (!fileData || !fileData.content) {
      throw createError('INVALID_INPUT', 'No file data provided');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Validate file data
      const validation = validateFileData(fileData);
      if (!validation.isValid) {
        throw createError('VALIDATION_ERROR', validation.error || 'Invalid file data');
      }

      // Extract fields from file data
      const fields = fileData.content.fields || [];
      if (!fields.length) {
        throw createError('VALIDATION_ERROR', 'No data fields found in file');
      }

      // Process and analyze the data
      const analysis = await analyzeData(fields);
      
      setProcessedData({
        ...analysis,
        originalData: fileData
      });
      
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process data';
      setError(errorMessage);
      throw createError('PROCESSING_ERROR', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    processedData,
    error,
    isProcessing,
    processFile
  };
}