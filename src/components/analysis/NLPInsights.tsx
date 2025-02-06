import React from 'react';
import { MessageSquare, Tag, FileText } from 'lucide-react';

interface NLPInsightsProps {
  sentiment: {
    score: number;
    label: string;
    confidence: number;
  };
  keywords: string[];
  summary: string;
  categories: string[];
}

export default function NLPInsights({ sentiment, keywords, summary, categories }: NLPInsightsProps) {
  const getSentimentColor = () => {
    switch (sentiment.label) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="text-indigo-600" />
        <h3 className="text-lg font-semibold">Text Analysis Insights</h3>
      </div>

      <div className="space-y-6">
        {/* Sentiment Analysis */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Sentiment Analysis</h4>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${getSentimentColor()}`}>
              {sentiment.label.charAt(0).toUpperCase() + sentiment.label.slice(1)}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    sentiment.label === 'positive' ? 'bg-green-600' :
                    sentiment.label === 'negative' ? 'bg-red-600' :
                    'bg-gray-600'
                  }`}
                  style={{ width: `${sentiment.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {(sentiment.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Key Terms
          </h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Summary
          </h4>
          <p className="text-gray-600 text-sm">{summary}</p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}