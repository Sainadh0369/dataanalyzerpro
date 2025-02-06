import { parse } from 'papaparse';

self.onmessage = (e: MessageEvent) => {
  const { file } = e.data;
  let headers: string[] = [];
  const fieldValues: Record<string, any[]> = {};
  let rowCount = 0;

  parse(file, {
    chunk: (results) => {
      const rows = results.data as any[][];
      if (rowCount === 0 && rows.length > 0) {
        headers = rows[0].map(String);
        headers.forEach(header => {
          fieldValues[header] = [];
        });
        rows.slice(1).forEach(row => {
          headers.forEach((header, i) => {
            fieldValues[header].push(row[i]);
          });
        });
      } else {
        rows.forEach(row => {
          headers.forEach((header, i) => {
            fieldValues[header].push(row[i]);
          });
        });
      }
      
      rowCount += rows.length;
      
      // Report progress
      self.postMessage({ 
        type: 'progress', 
        payload: { processed: rowCount }
      });
    },
    complete: () => {
      if (headers.length === 0) {
        self.postMessage({ 
          type: 'error', 
          payload: 'No headers found in CSV' 
        });
        return;
      }

      const fields = headers.map(header => ({
        name: header,
        type: inferType(fieldValues[header]),
        value: fieldValues[header]
      }));

      self.postMessage({ 
        type: 'complete', 
        payload: { fields } 
      });
    },
    error: (error) => {
      self.postMessage({ 
        type: 'error', 
        payload: error.message 
      });
    },
    header: false,
    skipEmptyLines: true,
    chunkSize: 1000
  });
};

function inferType(values: any[]): 'number' | 'string' | 'date' | 'boolean' {
  const nonNullValues = values.filter(v => v != null && v !== '');
  if (nonNullValues.length === 0) return 'string';

  const types = nonNullValues.map(value => {
    if (typeof value === 'number') return 'number';
    if (!isNaN(Number(value)) && value !== '') return 'number';
    if (!isNaN(Date.parse(String(value)))) return 'date';
    if (typeof value === 'boolean' || ['true', 'false'].includes(String(value).toLowerCase())) return 'boolean';
    return 'string';
  });

  const uniqueTypes = [...new Set(types)];
  return uniqueTypes[0] || 'string';
}