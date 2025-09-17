import React, { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  cacheHitRate: number;
  errorCount: number;
}

interface PerformanceConfig {
  enableMetrics: boolean;
  reportInterval: number;
  maxErrors: number;
}

export function usePerformanceMonitoring(
  componentName: string,
  config: PerformanceConfig = {
    enableMetrics: true,
    reportInterval: 30000, // 30 seconds
    maxErrors: 10,
  }
) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    errorCount: 0,
  });

  const renderStartRef = useRef<number>(0);
  const cacheHitsRef = useRef<number>(0);
  const cacheMissesRef = useRef<number>(0);

  // Start render timing
  const startRender = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  // End render timing
  const endRender = useCallback(() => {
    if (renderStartRef.current > 0) {
      const renderTime = performance.now() - renderStartRef.current;
      metricsRef.current.renderTime = renderTime;
      
      // Log slow renders
      if (renderTime > 100) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
      }
    }
  }, [componentName]);

  // Track cache hit
  const trackCacheHit = useCallback(() => {
    cacheHitsRef.current++;
    updateCacheHitRate();
  }, []);

  // Track cache miss
  const trackCacheMiss = useCallback(() => {
    cacheMissesRef.current++;
    updateCacheHitRate();
  }, []);

  // Update cache hit rate
  const updateCacheHitRate = useCallback(() => {
    const total = cacheHitsRef.current + cacheMissesRef.current;
    if (total > 0) {
      metricsRef.current.cacheHitRate = (cacheHitsRef.current / total) * 100;
    }
  }, []);

  // Track error
  const trackError = useCallback((error: Error) => {
    metricsRef.current.errorCount++;
    
    if (metricsRef.current.errorCount > config.maxErrors) {
      console.error(`Too many errors in ${componentName}:`, error);
    }
  }, [componentName, config.maxErrors]);

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }, []);

  // Update memory usage
  const updateMemoryUsage = useCallback(() => {
    metricsRef.current.memoryUsage = getMemoryUsage();
  }, [getMemoryUsage]);

  // Report metrics
  const reportMetrics = useCallback(() => {
    if (!config.enableMetrics) return;

    updateMemoryUsage();
    
    const metrics = {
      component: componentName,
      ...metricsRef.current,
      timestamp: Date.now(),
    };

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metrics for ${componentName}:`, metrics);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      // analytics.track('component_performance', metrics);
    }
  }, [componentName, config.enableMetrics, updateMemoryUsage]);

  // Setup periodic reporting
  useEffect(() => {
    if (!config.enableMetrics) return;

    const interval = setInterval(reportMetrics, config.reportInterval);
    return () => clearInterval(interval);
  }, [config.enableMetrics, config.reportInterval, reportMetrics]);

  // Track component mount/unmount
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  }, [startRender, endRender]);

  // Track errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return {
    startRender,
    endRender,
    trackCacheHit,
    trackCacheMiss,
    trackError,
    getMetrics: () => metricsRef.current,
    reportMetrics,
  };
}

// Hook for measuring specific operations
export function useOperationTimer(operationName: string) {
  const startTimeRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endTimer = useCallback(() => {
    if (startTimeRef.current > 0) {
      const duration = performance.now() - startTimeRef.current;
      console.log(`${operationName} took ${duration}ms`);
      return duration;
    }
    return 0;
  }, [operationName]);

  return { startTimer, endTimer };
}

// Hook for measuring API calls
export function useApiPerformance() {
  const apiMetricsRef = useRef<Map<string, { count: number; totalTime: number; errors: number }>>(new Map());

  const trackApiCall = useCallback((url: string, startTime: number, success: boolean) => {
    const duration = performance.now() - startTime;
    const existing = apiMetricsRef.current.get(url) || { count: 0, totalTime: 0, errors: 0 };
    
    existing.count++;
    existing.totalTime += duration;
    if (!success) {
      existing.errors++;
    }
    
    apiMetricsRef.current.set(url, existing);
  }, []);

  const getApiMetrics = useCallback(() => {
    const metrics: Record<string, any> = {};
    
    for (const [url, data] of apiMetricsRef.current.entries()) {
      metrics[url] = {
        count: data.count,
        averageTime: data.totalTime / data.count,
        errorRate: (data.errors / data.count) * 100,
      };
    }
    
    return metrics;
  }, []);

  return { trackApiCall, getApiMetrics };
}
