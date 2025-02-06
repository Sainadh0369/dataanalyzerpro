import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FileData } from '@/types/file';
import { createError } from '../core/error';

interface AnalysisDB extends DBSchema {
  analysisData: {
    key: string;
    value: FileData;
  };
}

const DB_NAME = 'analysisDB';
const STORE_NAME = 'analysisData';

let db: IDBPDatabase<AnalysisDB> | null = null;

async function getDB() {
  if (!db) {
    db = await openDB<AnalysisDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  }
  return db;
}

export async function storeAnalysisData(data: FileData): Promise<void> {
  try {
    const db = await getDB();
    const minimalData = {
      type: data.type,
      name: data.name,
      content: reduceDataSize(data.content)
    };

    try {
      await db.put(STORE_NAME, minimalData, 'currentAnalysis');
    } catch (storageError) {
      // If IndexedDB fails, try sessionStorage as fallback
      try {
        const serializedData = JSON.stringify(minimalData);
        sessionStorage.setItem('analysisData', serializedData);
      } catch (fallbackError) {
        throw createError('STORAGE_ERROR', 'Unable to store analysis data - dataset may be too large');
      }
    }
  } catch (error) {
    console.error('Error storing analysis data:', error);
    throw error;
  }
}

export async function getAnalysisData(): Promise<FileData | null> {
  try {
    const db = await getDB();
    const data = await db.get(STORE_NAME, 'currentAnalysis');
    if (data) return data;

    // Try fallback storage
    const fallbackData = sessionStorage.getItem('analysisData');
    return fallbackData ? JSON.parse(fallbackData) : null;
  } catch (error) {
    console.error('Error retrieving analysis data:', error);
    return null;
  }
}

export async function clearAnalysisData(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, 'currentAnalysis');
    sessionStorage.removeItem('analysisData');
  } catch (error) {
    console.error('Error clearing analysis data:', error);
  }
}

function reduceDataSize(content: FileData['content']) {
  const MAX_VALUES = 500; // Reduce max values to prevent storage issues
  const MAX_TEXT_LENGTH = 200; // Limit text field length

  return {
    fields: content.fields.map(field => ({
      name: field.name,
      type: field.type,
      value: field.value.length > MAX_VALUES
        ? field.value.slice(0, MAX_VALUES).map(v => 
            typeof v === 'string' && v.length > MAX_TEXT_LENGTH
              ? v.slice(0, MAX_TEXT_LENGTH) + '...'
              : v
          )
        : field.value.map(v =>
            typeof v === 'string' && v.length > MAX_TEXT_LENGTH
              ? v.slice(0, MAX_TEXT_LENGTH) + '...'
              : v
          )
    }))
  };
}