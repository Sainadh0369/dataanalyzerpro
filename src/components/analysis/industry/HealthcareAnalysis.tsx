import React from 'react';
import { Activity, Heart, TrendingUp, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { DataField } from '@/types/data';
import { HealthcareAnalyzer } from '@/utils/analysis/industry/healthcare';

interface HealthcareAnalysisProps {
  data: {
    fields: DataField[];
  };
}

export function HealthcareAnalysis({ data }: HealthcareAnalysisProps) {
  const outcomes = React.useMemo(() => 
    HealthcareAnalyzer.analyzePatientOutcomes(data.fields),
    [data.fields]
  );

  const treatments = React.useMemo(() =>
    HealthcareAnalyzer.analyzeTreatmentEffectiveness(data.fields),
    [data.fields]
  );

  return (
    <div className="space-y-8">
      {/* Patient Outcomes Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Patient Outcomes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Success Rate</h4>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">
                {(outcomes.successRate * 100).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 mb-1">of treatments</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Readmission Rate</h4>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">
                {(outcomes.readmissionRate * 100).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 mb-1">of patients</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Avg Recovery Time</h4>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">
                {outcomes.avgRecoveryTime.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 mb-1">days</span>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        {outcomes.riskFactors.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Identified Risk Factors</h4>
            <div className="grid gap-3">
              {outcomes.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-yellow-800">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Treatment Effectiveness */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Treatment Effectiveness</h3>
        </div>

        <div className="grid gap-6">
          {treatments.map((treatment, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">{treatment.treatment}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Confidence:</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full"
                      style={{ width: `${treatment.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Effectiveness Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Effectiveness</span>
                  <span className="text-sm font-medium">
                    {(treatment.effectiveness * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-teal-600 h-2.5 rounded-full"
                    style={{ width: `${treatment.effectiveness * 100}%` }}
                  />
                </div>
              </div>

              {/* Side Effects */}
              {treatment.sideEffects.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Reported Side Effects</h5>
                  <div className="flex flex-wrap gap-2">
                    {treatment.sideEffects.map((effect, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}