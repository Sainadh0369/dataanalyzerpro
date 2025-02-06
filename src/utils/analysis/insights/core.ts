import { DataField } from '../../../types';
import { generateStatisticalInsights } from './statistical';
import { generateTrendInsights } from './trends';
import { generateQualityInsights } from './quality';

export async function generateInsights(fields: DataField[]): Promise<string[]> {
  try {
    const insights: string[] = [];

    // Data quality insights
    const qualityInsights = generateQualityInsights(fields);
    insights.push(...qualityInsights);

    // Statistical insights for numeric fields
    const numericFields = fields.filter(field => field.type === 'number');
    if (numericFields.length > 0) {
      const statisticalInsights = generateStatisticalInsights(numericFields);
      insights.push(...statisticalInsights);
    }

    // Trend insights
    const trendInsights = generateTrendInsights(fields);
    insights.push(...trendInsights);

    return insights.filter(Boolean);
  } catch (error) {
    console.error('Error generating insights:', error);
    return ['Unable to generate insights from the dataset'];
  }
}