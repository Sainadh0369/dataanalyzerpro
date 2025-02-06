import { DataField } from '../../types';

export function aggregateData(fields: DataField[]): DataField[] {
  return fields.map(field => {
    if (field.type === 'number') {
      const values = field.value as number[];
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      
      return {
        ...field,
        metadata: {
          total: sum,
          average: sum / count,
          min: Math.min(...values),
          max: Math.max(...values),
          sampleSize: count
        }
      };
    }
    return field;
  });
}