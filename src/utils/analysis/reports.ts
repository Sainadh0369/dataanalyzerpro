import { DataField } from '@/types/data';
import { calculateFieldStats } from './statistics/calculations';
import { determineTrend } from './statistics/trends';
import { formatNumber } from './formatting';
import { createError } from '../core/error';

export async function generateReport(data: { fields: DataField[] }): Promise<any> {
  if (!data?.fields?.length) {
    throw createError('ANALYSIS_ERROR', 'No data available for report generation');
  }

  const report = {
    title: 'Data Analysis Report',
    timestamp: new Date().toISOString(),
    overview: generateOverview(data.fields),
    statistics: generateStatistics(data.fields),
    insights: generateInsights(data.fields),
    recommendations: generateRecommendations(data.fields)
  };

  return report;
}

export function downloadReport(report: any) {
  // Create report content
  const content = [
    `# ${report.title}`,
    `Generated on ${new Date(report.timestamp).toLocaleString()}`,
    '\n## Overview',
    ...report.overview,
    '\n## Statistics',
    ...formatStatistics(report.statistics),
    '\n## Key Insights',
    ...report.insights,
    '\n## Recommendations',
    ...report.recommendations
  ].join('\n');

  // Create and download file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analysis-report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateOverview(fields: DataField[]): string[] {
  const numericFields = fields.filter(f => f.type === 'number');
  const textFields = fields.filter(f => f.type === 'string');

  return [
    `Total Fields: ${fields.length}`,
    `Numeric Fields: ${numericFields.length}`,
    `Text Fields: ${textFields.length}`,
    `Total Records: ${fields[0]?.value.length || 0}`
  ];
}

function generateStatistics(fields: DataField[]): any {
  return fields
    .filter(f => f.type === 'number')
    .map(field => {
      const stats = calculateFieldStats(field);
      return {
        field: field.name,
        stats,
        trend: determineTrend(field.value as number[])
      };
    });
}

function generateInsights(fields: DataField[]): string[] {
  const insights: string[] = [];
  
  fields.forEach(field => {
    if (field.type === 'number') {
      const stats = calculateFieldStats(field);
      const trend = determineTrend(field.value as number[]);
      
      insights.push(
        `${field.name} shows ${trend} trend with average ${formatNumber(stats.mean)}`
      );
    }
  });

  return insights;
}

function generateRecommendations(fields: DataField[]): string[] {
  const recommendations: string[] = [];
  
  fields
    .filter(f => f.type === 'number')
    .forEach(field => {
      const trend = determineTrend(field.value as number[]);
      if (trend === 'down') {
        recommendations.push(
          `Investigate declining trend in ${field.name}`
        );
      }
    });

  return recommendations;
}

function formatStatistics(statistics: any[]): string[] {
  return statistics.map(stat => [
    `\n### ${stat.field}`,
    `Mean: ${formatNumber(stat.stats.mean)}`,
    `Median: ${formatNumber(stat.stats.median)}`,
    `Standard Deviation: ${formatNumber(stat.stats.stdDev)}`,
    `Trend: ${stat.trend}`,
    ''
  ]).flat();
}