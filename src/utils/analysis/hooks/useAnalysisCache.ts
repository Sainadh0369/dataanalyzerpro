import { useState, useCallback } from 'react';
import type { DataField, AnalyzedData } from '@types/data';

export function useAnalysisCache() {
  const [cache] = useState<Map<string, AnalyzedData>>(new Map());

  const getCacheKey = useCallback((fields: DataField[]): string => {
    return JSON.stringify(fields.map(f => ({
      name: f.name,
      type: f.type,
      hash: hashValues(f.value)
    })));
  }, []);

  const getFromCache = useCallback((fields: DataField[]): AnalyzedData | null => {
    const key = getCacheKey(fields);
    return cache.get(key) || null;
  }, [cache, getCacheKey]);

  const setInCache = useCallback((fields: DataField[], data: AnalyzedData): void => {
    const key = getCacheKey(fields);
    cache.set(key, data);
  }, [cache, getCacheKey]);

  const clearCache = useCallback(() => {
    cache.clear();
  }, [cache]);

  return {
    getFromCache,
    setInCache,
    clearCache
  };
}

function hashValues(values: any[]): string {
  return values
    .map(v => typeof v === 'number' ? v.toFixed(6) : String(v))
    .join('|');
}