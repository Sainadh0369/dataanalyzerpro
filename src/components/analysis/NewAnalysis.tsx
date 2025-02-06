import React from 'react';
import { FileUpload } from '@/components/file';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useNavigate } from 'react-router-dom';
import { storeAnalysisData } from '@/utils/storage/db';

export function NewAnalysis() {
  const navigate = useNavigate();
  const { handleFileUpload, isUploading, error } = useFileUpload(async (data) => {
    await storeAnalysisData(data);
    navigate('/analysis');
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Analysis</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <FileUpload
          onFileSelect={handleFileUpload}
          isProcessing={isUploading}
          error={error}
        />
      </div>
    </div>
  );
}