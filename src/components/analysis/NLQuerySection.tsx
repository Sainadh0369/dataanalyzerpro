import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { NLQueryInput } from './NLQueryInput';
import { NLQueryResponse } from './NLQueryResponse';
import { processNaturalLanguageQuery } from '@/utils/analysis/nlp/queryProcessor';
import type { DataField } from '@/types/data';

interface NLQuerySectionProps {
  data: {
    fields: DataField[];
  };
}

export function NLQuerySection({ data }: NLQuerySectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    try {
      const result = await processNaturalLanguageQuery(query, data.fields);
      setResponse(result);
    } catch (error) {
      setResponse({
        error: error instanceof Error ? error.message : 'Failed to process query'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold">Ask Questions About Your Data</h3>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <NLQueryInput
          onQuery={handleQuery}
          isLoading={isLoading}
          placeholder="Try asking: 'What are the trends?' or 'Show me a summary'"
        />
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Example questions you can ask:</p>
          <ul className="mt-2 space-y-1">
            <li>• What's the average of each field?</li>
            <li>• Show me the trends over time</li>
            <li>• Compare the different fields</li>
            <li>• What's the distribution of values?</li>
            <li>• Give me a summary of the data</li>
          </ul>
        </div>
      </div>

      {response && (
        <div className="mt-6">
          <NLQueryResponse response={response} />
        </div>
      )}
    </div>
  );
}