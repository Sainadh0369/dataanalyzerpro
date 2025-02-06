import React from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp, AlertCircle, Target } from 'lucide-react';
import type { SimulationResult } from '@/utils/analysis/simulation/types';
import { formatNumber } from '@/utils/analysis/formatting';

interface SimulationResultsProps {
  results: SimulationResult[];
}

export function SimulationResults({ results }: SimulationResultsProps) {
  return (
    <div className="space-y-8">
      {results.map((result, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-6">{result.field} Simulation</h3>

          {/* Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {result.scenarios.map((scenario, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  scenario.name === 'Best Case'
                    ? 'border-green-200 bg-green-50'
                    : scenario.name === 'Worst Case'
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{scenario.name}</h4>
                  <span className="text-sm font-medium">
                    {(scenario.probability * 100).toFixed()}% probability
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                <div className="space-y-1">
                  {Object.entries(scenario.adjustments).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key}:</span>
                      <span className={`font-medium ${
                        value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {value > 0 ? '+' : ''}{value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sensitivity Analysis */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-indigo-600" />
              <h4 className="font-medium">Sensitivity Analysis</h4>
            </div>
            
            {result.sensitivity.map((analysis, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-3">{analysis.variable}</h5>
                <div className="space-y-3">
                  {analysis.variations.map((variation, j) => (
                    <div key={j} className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 min-w-[80px]">
                        {variation.percentage > 0 ? '+' : ''}{variation.percentage}%
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            variation.direction === 'positive'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${variation.impact * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[80px]">
                        {(variation.impact * 100).toFixed(1)}% impact
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Elasticity: {analysis.elasticity.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h4 className="font-medium">Simulation Summary</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Best Case</p>
                <p className="font-medium">{formatNumber(result.summary.bestCase)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Base Case</p>
                <p className="font-medium">{formatNumber(result.summary.baseCase)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Worst Case</p>
                <p className="font-medium">{formatNumber(result.summary.worstCase)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Range</p>
                <p className="font-medium">{formatNumber(result.summary.range)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              <span className="text-sm text-gray-600">
                Simulation confidence: {(result.summary.confidence * 100).toFixed()}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}