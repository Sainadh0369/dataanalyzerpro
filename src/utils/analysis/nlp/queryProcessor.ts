import { DataField } from '@/types/data';
import { calculateFieldStats } from '../statistics/calculations';
import { determineTrend } from '../statistics/trends';
import { formatNumber } from '../statistics/formatting';

interface QueryResponse {
  answer: string;
  data?: DataField[];
  visualization?: {
    type: 'bar' | 'line' | 'scatter';
    title?: string;
  };
  error?: string;
}

export async function processNaturalLanguageQuery(query: string, fields: DataField[]): Promise<QueryResponse> {
  const normalizedQuery = query.toLowerCase().trim();
  
  try {
    // Handle statistical queries
    if (normalizedQuery.includes('average') || normalizedQuery.includes('mean')) {
      return handleAverageQuery(normalizedQuery, fields);
    }
    
    if (normalizedQuery.includes('trend') || normalizedQuery.includes('over time')) {
      return handleTrendQuery(normalizedQuery, fields);
    }
    
    if (normalizedQuery.includes('compare') || normalizedQuery.includes('correlation')) {
      return handleComparisonQuery(normalizedQuery, fields);
    }
    
    if (normalizedQuery.includes('distribution') || normalizedQuery.includes('spread')) {
      return handleDistributionQuery(normalizedQuery, fields);
    }
    
    if (normalizedQuery.includes('summary') || normalizedQuery.includes('overview')) {
      return handleSummaryQuery(normalizedQuery, fields);
    }

    // Default response for unrecognized queries
    return {
      answer: "I'm not sure how to answer that question. Try asking about trends, averages, comparisons, or distributions in your data.",
      error: "Query not recognized"
    };
  } catch (error) {
    return {
      answer: "I encountered an error while processing your query.",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

function handleAverageQuery(query: string, fields: DataField[]): QueryResponse {
  const numericFields = fields.filter(f => f.type === 'number');
  
  if (numericFields.length === 0) {
    return {
      answer: "I couldn't find any numeric fields to calculate averages.",
      error: "No numeric fields available"
    };
  }

  const averages = numericFields.map(field => {
    const values = field.value as number[];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { field: field.name, average: avg };
  });

  return {
    answer: `Here are the averages:\n${averages.map(a => 
      `${a.field}: ${formatNumber(a.average)}`
    ).join('\n')}`,
    data: numericFields,
    visualization: {
      type: 'bar',
      title: 'Field Averages'
    }
  };
}

function handleTrendQuery(query: string, fields: DataField[]): QueryResponse {
  const numericFields = fields.filter(f => f.type === 'number');
  
  if (numericFields.length === 0) {
    return {
      answer: "I couldn't find any numeric fields to analyze trends.",
      error: "No numeric fields available"
    };
  }

  const trends = numericFields.map(field => {
    const trend = determineTrend(field.value as number[]);
    return { field: field.name, trend };
  });

  return {
    answer: `Here are the trends I found:\n${trends.map(t => 
      `${t.field}: ${t.trend === 'up' ? 'Increasing' : t.trend === 'down' ? 'Decreasing' : 'Stable'}`
    ).join('\n')}`,
    data: numericFields,
    visualization: {
      type: 'line',
      title: 'Trends Over Time'
    }
  };
}

function handleComparisonQuery(query: string, fields: DataField[]): QueryResponse {
  const numericFields = fields.filter(f => f.type === 'number');
  
  if (numericFields.length < 2) {
    return {
      answer: "I need at least two numeric fields to make a comparison.",
      error: "Insufficient numeric fields"
    };
  }

  return {
    answer: "Here's a comparison of the numeric fields in your data.",
    data: numericFields,
    visualization: {
      type: 'scatter',
      title: 'Field Comparisons'
    }
  };
}

function handleDistributionQuery(query: string, fields: DataField[]): QueryResponse {
  const numericFields = fields.filter(f => f.type === 'number');
  
  if (numericFields.length === 0) {
    return {
      answer: "I couldn't find any numeric fields to analyze distributions.",
      error: "No numeric fields available"
    };
  }

  const distributions = numericFields.map(field => {
    const stats = calculateFieldStats(field);
    return {
      field: field.name,
      min: stats.min,
      max: stats.max,
      mean: stats.mean,
      stdDev: stats.stdDev
    };
  });

  return {
    answer: `Here are the distributions:\n${distributions.map(d => 
      `${d.field}:\n` +
      `  Range: ${formatNumber(d.min)} to ${formatNumber(d.max)}\n` +
      `  Mean: ${formatNumber(d.mean)}\n` +
      `  Standard Deviation: ${formatNumber(d.stdDev)}`
    ).join('\n\n')}`,
    data: numericFields,
    visualization: {
      type: 'bar',
      title: 'Data Distributions'
    }
  };
}

function handleSummaryQuery(query: string, fields: DataField[]): QueryResponse {
  const numericFields = fields.filter(f => f.type === 'number');
  const textFields = fields.filter(f => f.type === 'string');
  
  const summary = [
    `Your dataset contains ${fields.length} fields:`,
    `- ${numericFields.length} numeric fields`,
    `- ${textFields.length} text fields`,
    '',
    'Numeric Field Statistics:',
    ...numericFields.map(field => {
      const stats = calculateFieldStats(field);
      return `${field.name}:\n` +
        `  Average: ${formatNumber(stats.mean)}\n` +
        `  Trend: ${stats.trend === 'up' ? 'Increasing' : stats.trend === 'down' ? 'Decreasing' : 'Stable'}`;
    })
  ].join('\n');

  return {
    answer: summary,
    data: numericFields,
    visualization: {
      type: 'bar',
      title: 'Data Overview'
    }
  };
}