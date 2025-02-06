import { useState, useCallback } from 'react';
import { FileData } from '../../types';
import { processFile } from '../../utils/file/core';
import { validateFile } from '../../utils/file/validation';

export function useFileProcessing() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processUploadedFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate file first
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Process the file
      const result = await processFile(file);
      setFileData(result);
      return result;
    } catch (err) {
      console.error('File processing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    fileData,
    error,
    isProcessing,
    processUploadedFile,
  };
}