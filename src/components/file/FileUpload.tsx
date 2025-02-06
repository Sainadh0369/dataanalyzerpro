import React, { useCallback, useRef } from 'react';
import { Upload, Loader, AlertCircle } from 'lucide-react';
import { MAX_FILE_SIZE } from '@/utils/core/constants';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  progress?: number;
  error: Error | null;
}

export function FileUpload({ onFileSelect, isProcessing, progress = 0, error }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-teal-500', 'bg-teal-50');
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-teal-500', 'bg-teal-50');
  }, []);

  const handleClick = useCallback(() => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  }, [isProcessing]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      event.target.value = '';
    }
  }, [onFileSelect]);

  return (
    <div className="space-y-4">
      {isProcessing && (
        <div className="bg-teal-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Loader className="w-5 h-5 text-teal-600 animate-spin" />
            <p className="text-sm font-medium text-teal-900">Processing file...</p>
          </div>
          <div className="w-full bg-teal-100 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${error ? 'border-red-300 bg-red-50' : 
            isProcessing ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 
            'border-gray-300 hover:border-teal-500 hover:bg-teal-50'}`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader className="h-12 w-12 text-teal-500 animate-spin" />
            <p className="mt-4 text-sm text-gray-600">Processing file, please wait...</p>
          </div>
        ) : (
          <>
            <Upload className={`mx-auto h-12 w-12 ${error ? 'text-red-400' : 'text-gray-400'}`} />
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                Drop your data file here, or click to select
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: CSV and Excel (up to {(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-md">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Upload Error</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}