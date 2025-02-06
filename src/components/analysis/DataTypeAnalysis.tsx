import React from 'react';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { DataField } from '@/types/data';
import { analyzeDataTypes, DataTypeAnalysis } from '@/utils/analysis/dataTypeAnalysis';

interface DataTypeAnalysisViewProps {
  fields: DataField[];
}

export function DataTypeAnalysisView({ fields }: DataTypeAnalysisViewProps) {
  const typeAnalysis = analyzeDataTypes(fields);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Data Type Analysis</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Field
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pattern/Format
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Examples
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Validation
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(typeAnalysis).map(([fieldName, analysis]) => (
              <tr key={fieldName}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {fieldName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <TypeBadge type={analysis.type} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <ConfidenceIndicator confidence={analysis.confidence} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {analysis.pattern || analysis.validation?.format || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {analysis.examples.map((example, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {example}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {analysis.validation?.rules.map((rule, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                        {rule}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    integer: 'bg-blue-100 text-blue-800',
    decimal: 'bg-green-100 text-green-800',
    date: 'bg-purple-100 text-purple-800',
    email: 'bg-yellow-100 text-yellow-800',
    phone: 'bg-pink-100 text-pink-800',
    url: 'bg-indigo-100 text-indigo-800',
    boolean: 'bg-orange-100 text-orange-800',
    id: 'bg-gray-100 text-gray-800',
    string: 'bg-red-100 text-red-800',
    year: 'bg-teal-100 text-teal-800',
    unknown: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      colors[type] || colors.unknown
    }`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const Icon = confidence > 0.8 ? CheckCircle : AlertCircle;
  const color = confidence > 0.8 ? 'text-green-500' : 'text-amber-500';
  
  return (
    <div className="flex items-center gap-1">
      <Icon className={`w-4 h-4 ${color}`} />
      <span>{(confidence * 100).toFixed()}%</span>
    </div>
  );
}