import React, { useEffect, useRef } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { performanceBudget } from '@/utils/performanceBudget';

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  componentName, 
  children 
}) => {
  const {
    startRender,
    endRender,
    trackCacheHit,
    trackCacheMiss,
    trackError,
    getMetrics,
  } = usePerformanceMonitoring(componentName);

  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    startRender();
    renderStartRef.current = performance.now();

    return () => {
      endRender();
    };
  }, [startRender, endRender]);

  useEffect(() => {
    // Track component mount
    const mountTime = performance.now() - renderStartRef.current;
    
    // Record metrics
    performanceBudget.recordMetrics({
      renderTime: mountTime,
      timestamp: Date.now(),
    });

    // Track cache performance (basic heuristic)
    // If last render time is small, assume cache hit
    const current = performanceBudget.getCurrentMetrics();
    if (current && current.renderTime < 16) {
      trackCacheHit();
    } else {
      trackCacheMiss();
    }
  }, [trackCacheHit, trackCacheMiss]);

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

  return <>{children}</>;
};

export default PerformanceMonitor;