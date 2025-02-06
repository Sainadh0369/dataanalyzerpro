import { DataField } from '@/types/data';

export interface DataTypeAnalysis {
  type: string;
  confidence: number;
  pattern?: string;
  examples: string[];
  validation?: {
    rules: string[];
    format?: string;
  };
}

export function analyzeDataTypes(fields: DataField[]): Record<string, DataTypeAnalysis> {
  const analysis: Record<string, DataTypeAnalysis> = {};

  fields.forEach(field => {
    analysis[field.name] = inferDetailedType(field.value);
  });

  return analysis;
}

function inferDetailedType(values: any[]): DataTypeAnalysis {
  const nonNullValues = values.filter(v => v != null && v !== '');
  if (nonNullValues.length === 0) {
    return {
      type: 'unknown',
      confidence: 0,
      examples: []
    };
  }

  // Check numeric
  if (nonNullValues.every(v => !isNaN(Number(v)))) {
    const integers = nonNullValues.every(v => Number.isInteger(Number(v)));
    const analysis = {
      type: integers ? 'integer' : 'decimal',
      confidence: 1,
      examples: nonNullValues.slice(0, 3).map(String),
      validation: {
        rules: integers ? ['isInteger'] : ['isNumber'],
      }
    };

    // Check if it might be a year
    if (integers && nonNullValues.every(v => {
      const num = Number(v);
      return num >= 1900 && num <= 2100;
    })) {
      return {
        type: 'year',
        confidence: 0.9,
        examples: nonNullValues.slice(0, 3).map(String),
        validation: {
          rules: ['isInteger', 'isYear'],
          format: 'YYYY'
        }
      };
    }

    return analysis;
  }

  // Check date
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (nonNullValues.every(v => !isNaN(Date.parse(String(v))))) {
    const hasStandardFormat = nonNullValues.every(v => datePattern.test(String(v)));
    return {
      type: 'date',
      confidence: hasStandardFormat ? 1 : 0.8,
      pattern: hasStandardFormat ? 'YYYY-MM-DD' : 'various',
      examples: nonNullValues.slice(0, 3).map(String),
      validation: {
        rules: ['isDate'],
        format: hasStandardFormat ? 'YYYY-MM-DD' : undefined
      }
    };
  }

  // Check email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (nonNullValues.every(v => emailPattern.test(String(v)))) {
    return {
      type: 'email',
      confidence: 1,
      examples: nonNullValues.slice(0, 3).map(String),
      validation: {
        rules: ['isEmail']
      }
    };
  }

  // Check phone
  const phonePattern = /^\+?[\d\s-()]{10,}$/;
  if (nonNullValues.every(v => phonePattern.test(String(v)))) {
    return {
      type: 'phone',
      confidence: 0.9,
      examples: nonNullValues.slice(0, 3).map(String),
      validation: {
        rules: ['isPhone']
      }
    };
  }

  // Check URL
  const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
  if (nonNullValues.every(v => urlPattern.test(String(v)))) {
    return {
      type: 'url',
      confidence: 1,
      examples: nonNullValues.slice(0, 3).map(String),
      validation: {
        rules: ['isURL']
      }
    };
  }

  // Check boolean
  const booleanValues = ['true', 'false', '1', '0', 'yes', 'no'];
  if (nonNullValues.every(v => booleanValues.includes(String(v).toLowerCase()))) {
    return {
      type: 'boolean',
      confidence: 1,
      examples: nonNullValues.slice(0, 3).map(String),
      validation: {
        rules: ['isBoolean']
      }
    };
  }

  // Check if it might be an ID or code
  const idPattern = /^[A-Z0-9-_]+$/i;
  if (nonNullValues.every(v => idPattern.test(String(v)))) {
    return {
      type: 'id',
      confidence: 0.8,
      pattern: inferIdPattern(nonNullValues.map(String)),
      examples: nonNullValues.slice(0, 3).map(String),
      validation: {
        rules: ['matches'],
        format: inferIdPattern(nonNullValues.map(String))
      }
    };
  }

  // Default to string with pattern analysis
  return {
    type: 'string',
    confidence: 1,
    pattern: inferStringPattern(nonNullValues.map(String)),
    examples: nonNullValues.slice(0, 3).map(String),
    validation: {
      rules: ['isString']
    }
  };
}

function inferIdPattern(values: string[]): string {
  const parts = values[0].split(/[-_]/);
  const pattern = parts.map(part => {
    if (/^\d+$/.test(part)) return '\\d+';
    if (/^[A-Z]+$/.test(part)) return '[A-Z]+';
    if (/^[a-z]+$/.test(part)) return '[a-z]+';
    return '[A-Za-z0-9]+';
  }).join('[-_]');
  return `^${pattern}$`;
}

function inferStringPattern(values: string[]): string {
  const lengths = values.map(v => v.length);
  const minLength = Math.min(...lengths);
  const maxLength = Math.max(...lengths);
  
  if (minLength === maxLength) {
    return `Fixed length: ${minLength}`;
  }
  return `Variable length: ${minLength}-${maxLength}`;
}