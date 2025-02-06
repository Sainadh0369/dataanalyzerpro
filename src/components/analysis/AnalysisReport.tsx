import React from 'react';
import { Brain, TrendingUp, AlertCircle, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { DataField } from '@/types/data';
import { AIAnalyzer } from '@/utils/analysis/ai/analyzer';
import { formatNumber } from '@/utils/analysis/formatting';
import { DataInterpreter } from '@/utils/analysis/interpreter';
import { DataTransformer } from '@/utils/analysis/transformation';

interface AnalysisReportProps {
  data: {
    fields: DataField[];
  };
}

interface ComparisonInstruction {
  field: string;
  target: string;
  status: 'above' | 'below' | 'within';
  suggestion: string;
}

export function AnalysisReport({ data }: AnalysisReportProps) {
  const analyzer = new AIAnalyzer(data.fields);
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [instructions, setInstructions] = React.useState<ComparisonInstruction[]>([]);

  React.useEffect(() => {
    analyzer.analyze().then((result) => {
      setAnalysis(result);
      setInstructions(generateComparisonInstructions(result, data.fields));
    });
  }, [data]);

  if (!analysis) return null;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Fields Analyzed"
          value={data.fields.length}
          trend={data.fields.length > 5 ? 'up' : 'neutral'}
          description="Total number of data fields"
        />
        <MetricCard
          title="Data Quality"
          value={`${(analysis.statistics[0]?.significance === 'High confidence' ? 98 : 85)}%`}
          trend="up"
          description="Overall data reliability"
        />
        <MetricCard
          title="Patterns Found"
          value={analysis.patterns.reduce((acc: number, p: any) => acc + p.patterns.length, 0)}
          trend="up"
          description="Significant patterns detected"
        />
      </div>

      {/* Comparison Instructions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Comparison Instructions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suggestion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {instructions.map((instruction, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {instruction.field}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {instruction.target}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      instruction.status === 'above' ? 'bg-green-100 text-green-800' :
                      instruction.status === 'below' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {instruction.status.charAt(0).toUpperCase() + instruction.status.slice(1)} Target
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {instruction.suggestion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Key Findings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {analysis.statistics
                .filter((stat: any) => stat.significance === 'High confidence')
                .map((stat: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700">{stat.summary}</span>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Areas for Attention
            </h4>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Patterns & Correlations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Patterns Detected</h3>
          </div>
          <div className="space-y-4">
            {analysis.patterns.map((pattern: any, index: number) => (
              <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <h4 className="font-medium text-gray-900 mb-2">{pattern.field}</h4>
                <ul className="space-y-2">
                  {pattern.patterns.map((p: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-indigo-600 mt-1">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Correlations</h3>
          </div>
          <div className="space-y-4">
            {analysis.correlations.map((correlation: any, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-indigo-600 mt-1">•</span>
                <div>
                  <p className="text-gray-900 font-medium">
                    {correlation.fields.join(' & ')}
                  </p>
                  <p className="text-sm text-gray-600">{correlation.interpretation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Text Analysis */}
      {analysis.textInsights && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Text Analysis</h3>
          </div>
          <div className="space-y-6">
            {analysis.textInsights.map((insight: any, index: number) => (
              <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                <h4 className="font-medium text-gray-900 mb-4">{insight.field}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Common Patterns</h5>
                    <ul className="space-y-2">
                      {insight.commonPatterns.map((pattern: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600">• {pattern}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Categories</h5>
                    <div className="flex flex-wrap gap-2">
                      {insight.categorization.map((category: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

function MetricCard({ title, value, trend, description }: MetricCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-2xl font-semibold">{value}</p>
        <TrendIndicator trend={trend} />
      </div>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? XCircle : AlertCircle;
  const color = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';
  
  return <Icon className={`w-5 h-5 ${color}`} />;
}

function generateComparisonInstructions(
  analysis: any,
  fields: DataField[]
): ComparisonInstruction[] {
  const numericFields = fields.filter(f => f.type === 'number');
  const instructions: ComparisonInstruction[] = [];

  numericFields.forEach(field => {
    const values = field.value as number[];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    );

    // Set target as mean + 1 standard deviation for optimal performance
    const target = mean + stdDev;
    const current = values[values.length - 1];
    const status = current > target ? 'above' : current < target ? 'below' : 'within';

    instructions.push({
      field: field.name,
      target: formatNumber(target),
      status,
      suggestion: status === 'above' 
        ? `Maintain current performance above target of ${formatNumber(target)}`
        : status === 'below'
        ? `Work to increase value to reach target of ${formatNumber(target)}`
        : `Current value is within acceptable range of target ${formatNumber(target)}`
    });
  });

  return instructions;
}