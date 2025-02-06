import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalysisData } from '@/utils/storage/db';
import { AnalysisSection } from './AnalysisSection';
import type { FileData } from '@/types/file';

export function AnalysisResults() {
  const [data, setData] = React.useState<FileData | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function loadData() {
      try {
        const analysisData = await getAnalysisData();
        if (!analysisData) {
          navigate('/');
          return;
        }
        setData(analysisData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load analysis data'));
      }
    }
    loadData();
  }, [navigate]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
          {error.message}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <AnalysisSection data={data.content} category={null} results={null} />
    </div>
  );
}