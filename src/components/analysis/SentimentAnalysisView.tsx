import React from 'react';
import { MessageSquare, TrendingUp, Tag, FileText } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { DataField } from '@/types/data';
import { SentimentAnalyzer } from '@/utils/analysis/nlp/sentimentAnalyzer';

interface SentimentAnalysisViewProps {
  data: {
    fields: DataField[];
  };
}

export function SentimentAnalysisView({ data }: SentimentAnalysisViewProps) {
  const [analysis, setAnalysis] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function analyzeSentiment() {
      try {
        const results = await SentimentAnalyzer.analyzeSentiment(data.fields);
        setAnalysis(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze sentiment');
      } finally {
        setIsLoading(false);
      }
    }

    analyzeSentiment();
  }, [data.fields]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {analysis.map((result, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{result.field}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Confidence:</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full"
                  style={{ width: `${result.sentiment.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {(result.sentiment.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Sentiment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Overall Sentiment</h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  result.sentiment.label === 'positive' ? 'bg-green-500' :
                  result.sentiment.label === 'negative' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <span className="font-medium capitalize">{result.sentiment.label}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Score: {(result.sentiment.score * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Text Metrics</h4>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-gray-600">Words: </span>
                  <span className="font-medium">{result.metrics.wordCount}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Unique Words: </span>
                  <span className="font-medium">{result.metrics.uniqueWords}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Avg. Sentence Length: </span>
                  <span className="font-medium">
                    {result.metrics.avgSentenceLength.toFixed(1)} words
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Topics</h4>
              <div className="flex flex-wrap gap-2">
                {result.topics.map((topic: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-teal-600" />
              <h4 className="font-medium">Key Terms</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((keyword: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-teal-600" />
              <h4 className="font-medium">Analysis Summary</h4>
            </div>
            <p className="text-gray-600">{result.summary}</p>
          </div>
        </div>
      ))}
    </div>
  );
}