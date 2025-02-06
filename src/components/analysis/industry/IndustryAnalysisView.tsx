import React from 'react';
import { Briefcase, Brain, Beaker, ShoppingCart, LineChart, Stethoscope, Building2, PiggyBank } from 'lucide-react';
import { HealthcareAnalysis } from './HealthcareAnalysis';
import { RetailAnalysis } from './RetailAnalysis';
import { FinanceAnalysis } from './FinanceAnalysis';
import { DataField } from '@/types/data';

interface IndustryAnalysisViewProps {
  data: {
    fields: DataField[];
  };
}

export function IndustryAnalysisView({ data }: IndustryAnalysisViewProps) {
  const [selectedIndustry, setSelectedIndustry] = React.useState<string | null>(null);

  const industries = [
    {
      id: 'healthcare',
      name: 'Healthcare Analytics',
      description: 'Patient outcomes, treatment effectiveness, and healthcare metrics',
      icon: Stethoscope,
      component: HealthcareAnalysis
    },
    {
      id: 'retail',
      name: 'Retail Analytics',
      description: 'Sales analysis, inventory management, and customer metrics',
      icon: Building2,
      component: RetailAnalysis
    },
    {
      id: 'finance',
      name: 'Financial Analytics',
      description: 'Financial risk analysis, fraud detection, and performance metrics',
      icon: PiggyBank,
      component: FinanceAnalysis
    }
  ];

  return (
    <div className="space-y-8">
      {/* Industry Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="text-lg font-semibold">Industry Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">Select your industry for specialized analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {industries.map(industry => (
            <button
              key={industry.id}
              onClick={() => setSelectedIndustry(
                selectedIndustry === industry.id ? null : industry.id
              )}
              className={`p-6 rounded-lg text-left transition-colors border relative ${
                selectedIndustry === industry.id
                  ? 'border-teal-500 bg-teal-50 shadow-md transform -translate-y-1'
                  : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50 hover:shadow-sm hover:-translate-y-0.5'
              }`}
            >
              {selectedIndustry === industry.id && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-teal-500 rounded-full" />
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <industry.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h4 className="font-medium text-gray-900">{industry.name}</h4>
              </div>
              <p className="text-sm text-gray-600">{industry.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-teal-600">
                <Brain className="w-4 h-4" />
                <span>AI-powered analysis</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Industry-Specific Analysis */}
      {selectedIndustry && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
              <Brain className="w-4 h-4" />
              <span>Industry-Specific AI Analysis</span>
            </div>
          </div>
          {(() => {
            const industry = industries.find(i => i.id === selectedIndustry);
            if (!industry) return null;
            const AnalysisComponent = industry.component;
            return <AnalysisComponent data={data} />;
          })()}
        </div>
      )}
    </div>
  );
}