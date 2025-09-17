import React, { useEffect, useRef, useCallback } from 'react';

interface MemoryManagerOptions {
  maxCacheSize?: number; // Maximum cache size in MB
  cleanupInterval?: number; // Cleanup interval in ms
  enableGC?: boolean; // Enable garbage collection hints
}

export function useMemoryManagement(options: MemoryManagerOptions = {}) {
  const {
    maxCacheSize = 50, // 50MB default
    cleanupInterval = 30000, // 30 seconds
    enableGC = true,
  } = options;

  const cacheRef = useRef<Map<string, any>>(new Map());
  const lastCleanupRef = useRef<number>(Date.now());

  // Clean up old cache entries
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, value] of cacheRef.current.entries()) {
      if (value.timestamp && now - value.timestamp > maxAge) {
        cacheRef.current.delete(key);
      }
    }

    lastCleanupRef.current = now;
  }, []);

  // Get cache size in MB
  const getCacheSize = useCallback(() => {
    let size = 0;
    for (const [key, value] of cacheRef.current.entries()) {
      size += key.length * 2; // Approximate string size
      size += JSON.stringify(value).length * 2; // Approximate object size
    }
    return size / (1024 * 1024); // Convert to MB
  }, []);

  // Add item to cache with timestamp
  const addToCache = useCallback((key: string, value: any) => {
    cacheRef.current.set(key, {
      ...value,
      timestamp: Date.now(),
    });

    // Check if cache size exceeds limit
    if (getCacheSize() > maxCacheSize) {
      cleanupCache();
    }
  }, [maxCacheSize, getCacheSize, cleanupCache]);

  // Get item from cache
  const getFromCache = useCallback((key: string) => {
    const item = cacheRef.current.get(key);
    if (item && item.timestamp) {
      const maxAge = 5 * 60 * 1000; // 5 minutes
      if (Date.now() - item.timestamp > maxAge) {
        cacheRef.current.delete(key);
        return null;
      }
    }
    return item;
  }, []);

  // Clear specific cache entry
  const clearCacheEntry = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  // Clear all cache
  const clearAllCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Force garbage collection (if available)
  const forceGC = useCallback(() => {
    if (enableGC && 'gc' in window) {
      (window as any).gc();
    }
  }, [enableGC]);

  // Monitor memory usage
  const getMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize / (1024 * 1024), // MB
        total: memory.totalJSHeapSize / (1024 * 1024), // MB
        limit: memory.jsHeapSizeLimit / (1024 * 1024), // MB
      };
    }
    return null;
  }, []);

  // Setup periodic cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupCache();
      
      // Force GC if memory usage is high
      const memoryInfo = getMemoryInfo();
      if (memoryInfo && memoryInfo.used > memoryInfo.limit * 0.8) {
        forceGC();
      }
    }, cleanupInterval);

    return () => clearInterval(interval);
  }, [cleanupCache, cleanupInterval, getMemoryInfo, forceGC]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllCache();
    };
  }, [clearAllCache]);

  return {
    addToCache,
    getFromCache,
    clearCacheEntry,
    clearAllCache,
    getCacheSize,
    getMemoryInfo,
    forceGC,
  };
}

// Hook for managing component-specific memory
export function useComponentMemory(componentName: string) {
  const memoryManager = useMemoryManagement();

  const cacheKey = useCallback((key: string) => 
    `${componentName}:${key}`, 
    [componentName]
  );

  const addToComponentCache = useCallback((key: string, value: any) => {
    memoryManager.addToCache(cacheKey(key), value);
  }, [memoryManager, cacheKey]);

  const getFromComponentCache = useCallback((key: string) => {
    return memoryManager.getFromCache(cacheKey(key));
  }, [memoryManager, cacheKey]);

  const clearComponentCache = useCallback(() => {
    // Clear all cache entries for this component
    for (const [key] of memoryManager.cacheRef.current.entries()) {
      if (key.startsWith(`${componentName}:`)) {
        memoryManager.clearCacheEntry(key);
      }
    }
  }, [memoryManager, componentName]);

  return {
    addToComponentCache,
    getFromComponentCache,
    clearComponentCache,
    memoryInfo: memoryManager.getMemoryInfo(),
  };
}
