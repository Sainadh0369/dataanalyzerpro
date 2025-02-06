import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InsightListProps {
  insights: string[];
  title?: string;
}

export default function InsightList({ insights, title = 'Key Insights' }: InsightListProps) {
  if (!insights.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="text-indigo-600" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-indigo-600 mt-1">•</span>
            <span className="text-gray-700">{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}