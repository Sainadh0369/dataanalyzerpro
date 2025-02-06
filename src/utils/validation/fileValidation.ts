import { ValidationResult } from '../../types/validation';
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from '../core/constants';

export function validateFileType(fileName: string): ValidationResult {
  const extension = fileName.toLowerCase().split('.').pop();
  if (!extension || !SUPPORTED_FILE_TYPES.includes(extension as any)) {
    return {
      isValid: false,
      error: "Unsupported file type. Supported formats: " + SUPPORTED_FILE_TYPES.join(', ')
    };
  }
  return { isValid: true };
}

export function validateFileSize(size: number, maxSize: number = MAX_FILE_SIZE): ValidationResult {
  if (size > maxSize) {
    return {
      isValid: false,
      error: "File size too large. Maximum size is " + (maxSize / (1024 * 1024)) + "MB"
    };
  }
  return { isValid: true };
}

export function validateFile(file: File): ValidationResult {
  // Check file size
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Check file type
  return validateFileType(file.name);
}

export function validateFileData(fileData: any): ValidationResult {
  if (!fileData?.content?.fields?.length) {
    return {
      isValid: false,
      error: 'Invalid or empty file data'
    };
  }

  // Validate field structure
  const invalidFields = fileData.content.fields.filter((field: any) => 
    !field.name || !field.type || !Array.isArray(field.value)
  );

  if (invalidFields.length > 0) {
    return {
      isValid: false,
      error: 'Invalid field structure in file data'
    };
  }

  return { isValid: true };
}