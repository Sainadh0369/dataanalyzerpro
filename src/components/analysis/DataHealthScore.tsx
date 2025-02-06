import React from 'react';
import { Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface DataHealthScoreProps {
  score: number;
  results: Array<{
    field: { name: string };
    healthScore: number;
    fixes: Array<{
      type: string;
      count: number;
      description: string;
    }>;
  }>;
}

export function DataHealthScore({ score, results }: DataHealthScoreProps) {
  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return CheckCircle;
    if (score >= 70) return AlertCircle;
    return XCircle;
  };

  const getHealthLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold">Data Health Score</h3>
      </div>

      {/* Overall Score */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Overall Health</span>
          <div className="flex items-center gap-2">
            {React.createElement(getHealthIcon(score), {
              className: `w-5 h-5 ${getHealthColor(score)}`
            })}
            <span className={`text-2xl font-bold ${getHealthColor(score)}`}>
              {score}%
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              score >= 90 ? 'bg-green-600' :
              score >= 70 ? 'bg-yellow-500' :
              'bg-red-600'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Data health is {getHealthLabel(score).toLowerCase()}
        </p>
      </div>

      {/* Field Scores */}
      <div className="space-y-6">
        <h4 className="text-sm font-medium text-gray-900">Field Health Scores</h4>
        <div className="grid gap-4">
          {results.map((result, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">{result.field.name}</span>
                <span className={`font-medium ${getHealthColor(result.healthScore)}`}>
                  {result.healthScore}%
                </span>
              </div>

              {result.fixes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Issues Fixed:</p>
                  {result.fixes.map((fix, fixIndex) => (
                    <div key={fixIndex} className="flex items-start gap-2 text-sm">
                      <span className="text-teal-600 mt-1">•</span>
                      <span className="text-gray-600">{fix.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}