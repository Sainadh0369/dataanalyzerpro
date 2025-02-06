import React from 'react';
import { SWOTAnalysis as SWOTData, SWOTItem } from '../../utils/analysis/swot/types';
import { Shield, AlertTriangle, TrendingUp, AlertOctagon } from 'lucide-react';

interface SWOTAnalysisProps {
  analysis: SWOTData;
}

export default function SWOTAnalysis({ analysis }: SWOTAnalysisProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">SWOT Analysis</h2>

      {/* Score Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ScoreCard
          label="Internal Score"
          value={analysis.score.internal}
          description="Strengths vs Weaknesses"
        />
        <ScoreCard
          label="External Score"
          value={analysis.score.external}
          description="Opportunities vs Threats"
        />
        <ScoreCard
          label="Overall Score"
          value={analysis.score.overall}
          description="Combined Performance"
        />
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-2 gap-4">
        <SWOTSection
          title="Strengths"
          items={analysis.strengths}
          icon={<Shield className="w-5 h-5 text-green-500" />}
          className="bg-green-50"
        />
        <SWOTSection
          title="Weaknesses"
          items={analysis.weaknesses}
          icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
          className="bg-yellow-50"
        />
        <SWOTSection
          title="Opportunities"
          items={analysis.opportunities}
          icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
          className="bg-blue-50"
        />
        <SWOTSection
          title="Threats"
          items={analysis.threats}
          icon={<AlertOctagon className="w-5 h-5 text-red-500" />}
          className="bg-red-50"
        />
      </div>
    </div>
  );
}

interface ScoreCardProps {
  label: string;
  value: number;
  description: string;
}

function ScoreCard({ label, value, description }: ScoreCardProps) {
  const percentage = (value * 100).toFixed(1);
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className={`text-2xl font-bold ${getScoreColor(value)}`}>
        {percentage}%
      </p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}

interface SWOTSectionProps {
  title: string;
  items: SWOTItem[];
  icon: React.ReactNode;
  className?: string;
}

function SWOTSection({ title, items, icon, className }: SWOTSectionProps) {
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <div>
              <p className="text-sm">{item.description}</p>
              {item.impact && (
                <span className={`text-xs font-medium ${
                  item.impact === 'high' ? 'text-red-600' :
                  item.impact === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {item.impact} impact
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}