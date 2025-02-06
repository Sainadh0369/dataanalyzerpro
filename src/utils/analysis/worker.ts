import { DataField } from '@/types/data';
import { calculateStatistics } from './statistics';
import { performRegression } from './regression';

self.onmessage = async (e: MessageEvent) => {
  const { fields, type } = e.data;

  try {
    let result;
    switch (type) {
      case 'statistics':
        result = calculateStatistics(fields);
        break;
      case 'regression':
        result = performRegression(fields);
        break;
      default:
        throw new Error('Unknown analysis type');
    }

    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Analysis failed' 
    });
  }
};