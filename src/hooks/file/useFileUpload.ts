import { useState, useCallback } from 'react';
import { FileData } from '../../types';
import { processFile } from '../../utils/file/processing';
import { validateFile } from '../../utils/validation/fileValidation';
import { createError } from '../../utils/core/error';

export function useFileUpload(onSuccess: (data: FileData) => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file first
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw createError('INVALID_INPUT', validation.error || 'Invalid file');
      }

      // Process file
      const processedData = await processFile(file);
      if (!processedData) {
        throw createError('PROCESSING_ERROR', 'Failed to process file');
      }

      if (onSuccess && processedData) {
        onSuccess(processedData);
      }
      return processedData;
    } catch (err) {
      console.error('File upload error:', err);
      const error = err instanceof Error ? err : new Error('Failed to process file');
      setError(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [onSuccess]);

  return {
    isUploading,
    error,
    progress,
    handleFileUpload
  };
}