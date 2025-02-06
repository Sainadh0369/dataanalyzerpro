import React from 'react';
import { Brain, AlertCircle } from 'lucide-react';
import { ChartView } from '@components/visualization';
import type { DataField } from '@/types/data';

interface NLQueryResponseProps {
  response: {
    answer: string;
    data?: DataField[];
    visualization?: {
      type: 'bar' | 'line' | 'scatter';
      title?: string;
    };
    error?: string;
  } | null;
}

export function NLQueryResponse({ response }: NLQueryResponseProps) {
  if (!response) return null;

  if (response.error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-700 font-medium">Error</p>
          <p className="text-red-600 mt-1">{response.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
      <div className="flex items-start gap-3">
        <Brain className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
        <div className="prose prose-teal max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{response.answer}</p>
        </div>
      </div>

      {response.data && response.visualization && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="h-[300px]">
            <ChartView
              data={response.data}
              type={response.visualization.type}
              title={response.visualization.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}