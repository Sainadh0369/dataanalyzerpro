import React from 'react';
import { FileText, Download, Palette, Image, Settings, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DataField } from '@/types/data';
import { formatNumber } from '@/utils/analysis/formatting';
import { calculateFieldStats } from '@/utils/analysis/statistics/calculations';

interface ReportGeneratorProps {
  data: {
    fields: DataField[];
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
  };
}

export function ReportGenerator({ data, branding }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [customBranding, setCustomBranding] = React.useState(branding || {
    primaryColor: '#0d9488',
    companyName: 'DataAnalyzer Pro'
  });
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Get the report content element
      const reportContent = document.getElementById('report-content');
      if (!reportContent) throw new Error('Report content not found');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      // Add title page
      pdf.setFillColor(customBranding.primaryColor);
      pdf.rect(0, 0, pdf.internal.pageSize.width, 60, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('Data Analysis Report', 40, 40);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 40, 80);
      pdf.text(`By ${customBranding.companyName}`, 40, 100);

      // Add table of contents
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Table of Contents', 40, 40);
      pdf.setFontSize(12);
      let yPos = 70;
      const sections = [
        'Executive Summary',
        'Data Overview',
        'Statistical Analysis',
        'Key Findings',
        'Visualizations',
        'Technical Specifications',
        'Recommendations'
      ];
      sections.forEach((section, index) => {
        pdf.text(`${index + 1}. ${section}`, 40, yPos);
        yPos += 20;
      });

      // Executive Summary
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('1. Executive Summary', 40, 40);
      pdf.setFontSize(12);
      pdf.text([
        'This report provides a comprehensive analysis of the uploaded dataset,',
        'including statistical analysis, key findings, and recommendations.',
        '',
        `Dataset contains ${data.fields.length} fields with various metrics and indicators.`,
        'The analysis reveals significant patterns and insights that can inform decision-making.'
      ], 40, 70);

      // Data Overview
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('2. Data Overview', 40, 40);
      pdf.setFontSize(12);
      yPos = 70;
      data.fields.forEach(field => {
        const stats = calculateFieldStats(field);
        pdf.text(`Field: ${field.name}`, 40, yPos);
        yPos += 20;
        pdf.text(`Type: ${field.type}`, 60, yPos);
        yPos += 20;
        if (field.type === 'number') {
          pdf.text(`Mean: ${formatNumber(stats.mean)}`, 60, yPos);
          yPos += 20;
          pdf.text(`Standard Deviation: ${formatNumber(stats.stdDev)}`, 60, yPos);
          yPos += 20;
        }
        yPos += 20;
      });

      // Statistical Analysis
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('3. Statistical Analysis', 40, 40);
      const numericFields = data.fields.filter(f => f.type === 'number');
      yPos = 70;
      numericFields.forEach(field => {
        const stats = calculateFieldStats(field);
        pdf.text(`${field.name} Statistics:`, 40, yPos);
        yPos += 20;
        pdf.text([
          `Mean: ${formatNumber(stats.mean)}`,
          `Median: ${formatNumber(stats.median)}`,
          `Standard Deviation: ${formatNumber(stats.stdDev)}`,
          `Min: ${formatNumber(stats.min)}`,
          `Max: ${formatNumber(stats.max)}`
        ], 60, yPos);
        yPos += 80;
      });

      // Add visualizations
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('4. Visualizations', 40, 40);

      // Convert charts to images
      const charts = document.querySelectorAll('.chart-container canvas');
      let chartYPos = 70;
      for (const chart of Array.from(charts)) {
        const canvas = await html2canvas(chart as HTMLElement);
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 40, chartYPos, 500, 300);
        chartYPos += 320;
        if (chartYPos > pdf.internal.pageSize.height - 100) {
          pdf.addPage();
          chartYPos = 40;
        }
      }

      // Technical Specifications
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('5. Technical Specifications', 40, 40);
      pdf.setFontSize(12);
      pdf.text([
        'Analysis Parameters:',
        `- Total Fields: ${data.fields.length}`,
        `- Numeric Fields: ${numericFields.length}`,
        `- Text Fields: ${data.fields.filter(f => f.type === 'string').length}`,
        `- Date Fields: ${data.fields.filter(f => f.type === 'date').length}`,
        '',
        'Processing Information:',
        '- Statistical Analysis: Completed',
        '- Trend Analysis: Completed',
        '- Correlation Analysis: Completed',
        '- Outlier Detection: Completed'
      ], 40, 70);

      // Recommendations
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('6. Recommendations', 40, 40);
      pdf.setFontSize(12);
      const recommendations = generateRecommendations(data.fields);
      pdf.text(recommendations, 40, 70);

      // Save PDF
      pdf.save(`analysis-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Generate Report</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomizing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50"
          >
            <Settings className="w-4 h-4" />
            Customize
          </button>
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
                Generate PDF
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Report Preview */}
      <div id="report-content" className="hidden">
        {/* Content will be rendered here for PDF generation */}
      </div>

      {/* Customization Modal */}
      {isCustomizing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold">Customize Report</h3>
              </div>
              <button
                onClick={() => setIsCustomizing(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={customBranding.companyName}
                  onChange={(e) => setCustomBranding(prev => ({
                    ...prev,
                    companyName: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customBranding.primaryColor}
                    onChange={(e) => setCustomBranding(prev => ({
                      ...prev,
                      primaryColor: e.target.value
                    }))}
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customBranding.primaryColor}
                    onChange={(e) => setCustomBranding(prev => ({
                      ...prev,
                      primaryColor: e.target.value
                    }))}
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={customBranding.logo || ''}
                  onChange={(e) => setCustomBranding(prev => ({
                    ...prev,
                    logo: e.target.value
                  }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setIsCustomizing(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsCustomizing(false)}
                className="px-4 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateRecommendations(fields: DataField[]): string[] {
  const recommendations = [
    'Based on the analysis, we recommend:',
    ''
  ];

  const numericFields = fields.filter(f => f.type === 'number');
  numericFields.forEach(field => {
    const stats = calculateFieldStats(field);
    if (stats.trend === 'up') {
      recommendations.push(`- Continue positive trend in ${field.name}`);
    } else if (stats.trend === 'down') {
      recommendations.push(`- Investigate declining trend in ${field.name}`);
    }
  });

  recommendations.push(
    '',
    'Next Steps:',
    '- Review identified patterns',
    '- Implement suggested improvements',
    '- Monitor key metrics',
    '- Schedule follow-up analysis'
  );

  return recommendations;
}