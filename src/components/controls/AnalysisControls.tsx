import React from 'react';
import { X } from 'lucide-react';

interface AnalysisControlsProps {
  settings: {
    enableML: boolean;
    enableNLP: boolean;
    enablePredictive: boolean;
    enableRegression: boolean;
    enableTimeSeries: boolean;
  };
  onChange: (settings: AnalysisControlsProps['settings']) => void;
  onClose: () => void;
}

export default function AnalysisControls({ settings, onChange, onClose }: AnalysisControlsProps) {
  const handleChange = (key: keyof typeof settings) => {
    onChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  return (
    <div className="w-full max-w-md bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Analysis Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Machine Learning Analysis</span>
            <input
              type="checkbox"
              checked={settings.enableML}
              onChange={() => handleChange('enableML')}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-700">Natural Language Processing</span>
            <input
              type="checkbox"
              checked={settings.enableNLP}
              onChange={() => handleChange('enableNLP')}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-700">Predictive Analytics</span>
            <input
              type="checkbox"
              checked={settings.enablePredictive}
              onChange={() => handleChange('enablePredictive')}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-700">Regression Analysis</span>
            <input
              type="checkbox"
              checked={settings.enableRegression}
              onChange={() => handleChange('enableRegression')}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-700">Time Series Analysis</span>
            <input
              type="checkbox"
              checked={settings.enableTimeSeries}
              onChange={() => handleChange('enableTimeSeries')}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}