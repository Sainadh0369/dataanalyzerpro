import React from 'react';
import { CheckCircle, XCircle, Brain } from 'lucide-react';
import { DataField } from '@/types/data';
import { calculateFieldStats } from '@/utils/analysis/statistics';

interface ComparisonReportProps {
  data: {
    fields: DataField[];
  };
}

export function ComparisonReport({ data }: ComparisonReportProps) {
  const numericFields = data.fields.filter(f => f.type === 'number');
  const insights = generateInsights(numericFields);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Analysis Report</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-medium">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {insights.pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium">Areas for Improvement</h4>
          </div>
          <ul className="space-y-2">
            {insights.cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span className="text-gray-700">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function generateInsights(fields: DataField[]) {
  const pros: string[] = [];
  const cons: string[] = [];

  fields.forEach(field => {
    const stats = calculateFieldStats(field);
    
    // Analyze trends
    if (stats.trend === 'up') {
      pros.push(`${field.name} shows positive growth trend`);
    } else if (stats.trend === 'down') {
      cons.push(`${field.name} shows declining trend`);
    }

    // Analyze consistency
    const cv = stats.stdDev / stats.mean; // Coefficient of variation
    if (cv < 0.1) {
      pros.push(`${field.name} shows consistent performance`);
    } else if (cv > 0.3) {
      cons.push(`${field.name} shows high variability`);
    }

    // Analyze performance levels
    const range = stats.max - stats.min;
    if (range / stats.mean < 0.2) {
      pros.push(`${field.name} maintains stable levels`);
    } else {
      cons.push(`${field.name} shows significant fluctuations`);
    }
  });

  return { pros, cons };
}