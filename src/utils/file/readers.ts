import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedData } from '../../types';
import { inferDataTypes } from './inference';

export function readCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const parsedData = processParseResults(results.data);
          resolve(parsedData);
        } catch (error) {
          reject(new Error('Failed to parse CSV file'));
        }
      },
      error: (error) => reject(new Error(error.message)),
      header: false,
      skipEmptyLines: true,
    });
  });
}

export async function readExcel(file: File): Promise<ParsedData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    if (!workbook.SheetNames.length) {
      throw new Error('Excel file contains no sheets');
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    return processParseResults(jsonData);
  } catch (error) {
    throw new Error('Failed to parse Excel file');
  }
}

function processParseResults(data: any[][]): ParsedData {
  if (!data || data.length < 2) {
    throw new Error('File is empty or contains only headers');
  }

  const headers = data[0] as string[];
  const rows = data.slice(1) as any[][];

  // Filter out empty rows
  const filteredRows = rows.filter(row => 
    row.some(cell => cell !== null && cell !== undefined && cell !== '')
  );

  if (!filteredRows.length) {
    throw new Error('No valid data rows found in file');
  }

  return {
    headers,
    rows: filteredRows,
    summary: {
      totalRows: filteredRows.length,
      totalColumns: headers.length,
      dataTypes: inferDataTypes(headers, filteredRows),
    },
  };
}