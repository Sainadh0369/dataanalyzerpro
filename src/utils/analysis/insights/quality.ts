import { DataField } from '../../../types';

export function generateQualityInsights(fields: DataField[]): string[] {
  const insights: string[] = [];

  // Analyze completeness
  fields.forEach(field => {
    const nullCount = field.value.filter(v => v == null || v === '').length;
    const completeness = ((field.value.length - nullCount) / field.value.length) * 100;

    if (completeness < 100) {
      insights.push(`${field.name} is ${completeness.toFixed(1)}% complete`);
    }
  });

  // Analyze data types distribution
  const typeDistribution = fields.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  insights.push(
    `Dataset contains ${Object.entries(typeDistribution)
      .map(([type, count]) => `${count} ${type} field${count > 1 ? 's' : ''}`)
      .join(', ')}`
  );

  // Analyze value ranges for numeric fields
  fields
    .filter(field => field.type === 'number')
    .forEach(field => {
      const values = field.value as number[];
      const min = Math.min(...values);
      const max = Math.max(...values);
      insights.push(`${field.name} ranges from ${min} to ${max}`);
    });

  return insights;
}