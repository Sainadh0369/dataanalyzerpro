import React from 'react';
import { FileText, Download, Brain, Calculator, TrendingUp, AlertCircle, ChevronDown } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { DataField } from '@/types/data';
import { calculateFieldStats } from '@/utils/analysis/statistics/calculations';
import { determineTrend } from '@/utils/analysis/statistics/trends';
import { formatNumber } from '@/utils/analysis/formatting';

interface ComprehensiveReportProps {
  data: {
    fields: DataField[];
  };
  analysis: any;
}

export function ComprehensiveReport({ data, analysis }: ComprehensiveReportProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Generate report sections
      const sections = [
        generateExecutiveSummary(data),
        generateMethodology(data),
        generateStatisticalAnalysis(data),
        generateCorrelationAnalysis(data),
        generateHypothesisTests(data),
        generateAnomalies(data),
        generateConclusions(data)
      ];

      // Create report content
      const reportContent = document.createElement('div');
      reportContent.innerHTML = sections.join('\n\n');

      // Create download link
      const blob = new Blob([reportContent.innerText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprehensive-analysis-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Comprehensive Analysis Report</h3>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Report
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Report Preview */}
        <div className="space-y-8">
          {/* Executive Summary */}
          <Section
            title="Executive Summary"
            icon={Brain}
            content={generateExecutiveSummary(data)}
          />

          {/* Methodology */}
          <Section
            title="Methodology"
            icon={Calculator}
            content={generateMethodology(data)}
          />

          {/* Statistical Analysis */}
          <Section
            title="Statistical Analysis"
            icon={TrendingUp}
            content={generateStatisticalAnalysis(data)}
          />

          {/* Correlation Analysis */}
          <Section
            title="Correlation Analysis"
            icon={TrendingUp}
            content={generateCorrelationAnalysis(data)}
          />

          {/* Hypothesis Tests */}
          <Section
            title="Hypothesis Tests"
            icon={Calculator}
            content={generateHypothesisTests(data)}
          />

          {/* Anomalies */}
          <Section
            title="Anomalies & Outliers"
            icon={AlertCircle}
            content={generateAnomalies(data)}
          />

          {/* Conclusions */}
          <Section
            title="Conclusions & Recommendations"
            icon={Brain}
            content={generateConclusions(data)}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ 
  title, 
  icon: Icon, 
  content 
}: { 
  title: string; 
  icon: React.ElementType; 
  content: string;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-teal-600" />
          <h4 className="font-medium text-gray-900">{title}</h4>
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </button>
      {isExpanded && (
        <div className="px-6 pb-4">
          <div className="prose prose-sm max-w-none">
            {content.split('\n').map((line, index) => (
              <p key={index} className="text-gray-600">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Report generation helper functions
function generateExecutiveSummary(data: { fields: DataField[] }): string {
  const numericFields = data.fields.filter(f => f.type === 'number');
  const textFields = data.fields.filter(f => f.type === 'string');
  const dateFields = data.fields.filter(f => f.type === 'date');

  return `Executive Summary

Dataset Overview:
- Total Fields: ${data.fields.length}
- Numeric Fields: ${numericFields.length}
- Text Fields: ${textFields.length}
- Date Fields: ${dateFields.length}
- Total Records: ${data.fields[0]?.value.length || 0}

Key Findings:
${numericFields.map(field => {
  const stats = calculateFieldStats(field);
  const trend = determineTrend(field.value as number[]);
  return `- ${field.name}: ${trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'} trend, average ${formatNumber(stats.mean)}`;
}).join('\n')}

Analysis Scope:
This comprehensive analysis includes statistical calculations, trend analysis, correlation studies, and anomaly detection.`;
}

// Add other report generation functions here...
// generateMethodology, generateStatisticalAnalysis, etc.