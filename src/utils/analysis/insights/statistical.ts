import { DataField } from '../../../types';
import { calculateStatistics } from '../statistics';

export function generateStatisticalInsights(fields: DataField[]): string[] {
  const insights: string[] = [];
  const statistics = calculateStatistics(fields);

  // Analyze mean and standard deviation
  Object.entries(statistics.mean).forEach(([fieldName, mean]) => {
    const stdDev = statistics.standardDeviation[fieldName];
    const cv = (stdDev / mean) * 100; // Coefficient of variation

    if (cv > 50) {
      insights.push(`${fieldName} shows high variability (CV: ${cv.toFixed(1)}%)`);
    } else if (cv < 10) {
      insights.push(`${fieldName} shows consistent values (CV: ${cv.toFixed(1)}%)`);
    }
  });

  // Analyze correlations
  Object.entries(statistics.correlations)
    .filter(([_, value]) => Math.abs(value) > 0.7)
    .forEach(([key, value]) => {
      const [field1, field2] = key.split('_');
      insights.push(
        `Strong ${value > 0 ? 'positive' : 'negative'} correlation between ${field1} and ${field2}`
      );
    });

  return insights;
}