import { DataField } from '@/types/data';

export class DataTransformer {
  static normalize(field: DataField): number[] {
    const values = field.value as number[];
    const min = Math.min(...values);
    const max = Math.max(...values);
    return values.map(v => (v - min) / (max - min));
  }

  static standardize(field: DataField): number[] {
    const values = field.value as number[];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    );
    return values.map(v => (v - mean) / stdDev);
  }

  static movingAverage(field: DataField, window: number): number[] {
    const values = field.value as number[];
    return values.map((_, i) => {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(values.length, i + Math.floor(window / 2) + 1);
      const windowValues = values.slice(start, end);
      return windowValues.reduce((a, b) => a + b, 0) / windowValues.length;
    });
  }

  static detectAndRemoveOutliers(field: DataField): number[] {
    const values = field.value as number[];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    );
    
    return values.filter(v => Math.abs(v - mean) <= 2 * stdDev);
  }

  static interpolateMissingValues(field: DataField): number[] {
    const values = field.value as number[];
    const result = [...values];
    
    for (let i = 0; i < result.length; i++) {
      if (result[i] == null) {
        const prevValue = result.slice(0, i).findLast(v => v != null);
        const nextValue = result.slice(i + 1).find(v => v != null);
        
        if (prevValue != null && nextValue != null) {
          result[i] = (prevValue + nextValue) / 2;
        } else if (prevValue != null) {
          result[i] = prevValue;
        } else if (nextValue != null) {
          result[i] = nextValue;
        }
      }
    }
    
    return result;
  }

  static categorize(field: DataField, bins: number): string[] {
    const values = field.value as number[];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    
    return values.map(v => {
      const binIndex = Math.min(Math.floor((v - min) / binSize), bins - 1);
      return `${(min + binIndex * binSize).toFixed(2)} - ${(min + (binIndex + 1) * binSize).toFixed(2)}`;
    });
  }
}