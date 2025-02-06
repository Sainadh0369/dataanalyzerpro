import { useState, useCallback } from 'react';
import { validateFile } from '../../utils/file/validation';

export function useFileValidation() {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUploadedFile = useCallback((file: File) => {
    const result = validateFile(file);
    setIsValid(result.isValid);
    setError(result.error || null);
    return result.isValid;
  }, []);

  return {
    isValid,
    error,
    validateUploadedFile,
  };
}