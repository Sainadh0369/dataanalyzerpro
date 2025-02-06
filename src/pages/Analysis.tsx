import { AnalysisSection } from '@/components/analysis';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAnalysisData } from '@/utils/storage/db';
import type { FileData } from '@/types/file';
import { Brain, ArrowLeft } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { performAnalysis } from '@/utils/analysis/core';

export function Analysis() {
  const [data, setData] = useState<FileData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const analysisData = await getAnalysisData();
        if (!analysisData) {
          navigate('/');
          return;
        }
        setData(analysisData);
      } catch (err) {
        setError(new Error('Failed to load analysis data'));
      }
    }
    loadData();
  }, [navigate]);

  const analysisResults = useMemo(() => {
    if (!data || !category) return null;
    try {
      const results = performAnalysis(data.content.fields, category);
      if (!results) {
        throw new Error('No analysis results available');
      }
      return results;
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        type: category,
        error: error instanceof Error ? error.message : 'Failed to perform analysis',
        details: error
      };
    }
  }, [data, category]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Upload
        </button>
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
        </div>
      </div>

      {data ? (
        <AnalysisSection 
          data={data.content} 
          category={category}
          results={analysisResults}
        />
      ) : (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      )}
    </div>
  );
}