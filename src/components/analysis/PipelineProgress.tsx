import React from 'react';
import { Pipeline } from '../../types';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface PipelineProgressProps {
  pipeline: Pipeline;
}

export default function PipelineProgress({ pipeline }: PipelineProgressProps) {
  const completedStages = pipeline.stages.filter(s => s.status === 'completed').length;
  const progress = (completedStages / pipeline.stages.length) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Analysis Progress</h3>
        <span className="text-sm text-gray-600">
          {completedStages} of {pipeline.stages.length} stages complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage List */}
      <div className="space-y-4">
        {pipeline.stages.map((stage, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {stage.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {stage.status === 'error' && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {stage.status === 'processing' && (
                <Loader className="w-5 h-5 text-indigo-500 animate-spin" />
              )}
              {stage.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
              )}
              <span className={`text-sm ${
                stage.status === 'error' ? 'text-red-600' :
                stage.status === 'completed' ? 'text-green-600' :
                stage.status === 'processing' ? 'text-indigo-600' :
                'text-gray-600'
              }`}>
                {stage.name}
              </span>
            </div>
            {stage.error && (
              <span className="text-sm text-red-600">{stage.error}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}