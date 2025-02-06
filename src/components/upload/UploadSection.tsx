import React from 'react';
import { FileUpload } from './FileUpload';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  error: Error | null;
}

export function UploadSection({ onFileSelect, isProcessing, error }: UploadSectionProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <FileUpload 
        onFileSelect={onFileSelect}
        isProcessing={isProcessing}
        error={error}
      />
    </div>
  );
}