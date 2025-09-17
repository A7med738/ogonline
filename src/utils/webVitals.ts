// Web Vitals measurement and reporting
export interface WebVitals {
  CLS: number; // Cumulative Layout Shift
  FID: number; // First Input Delay
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  TTFB: number; // Time to First Byte
}

class WebVitalsReporter {
  private vitals: Partial<WebVitals> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              this.vitals.CLS = (this.vitals.CLS || 0) + (entry as any).value;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // FCP (First Contentful Paint)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.vitals.FCP = entry.startTime;
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported:', error);
      }

      // LCP (Largest Contentful Paint)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.vitals.LCP = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.vitals.FID = (entry as any).processingStart - entry.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }

    // TTFB (Time to First Byte)
    this.measureTTFB();
  }

  private measureTTFB() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.vitals.TTFB = navigation.responseStart - navigation.requestStart;
      }
    }
  }

  public getVitals(): Partial<WebVitals> {
    return { ...this.vitals };
  }

  public reportVitals() {
    const vitals = this.getVitals();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', vitals);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      // analytics.track('web_vitals', vitals);
    }
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
const webVitalsReporter = new WebVitalsReporter();

// Export functions
export const measureWebVitals = () => {
  return webVitalsReporter.getVitals();
};

export const reportWebVitals = () => {
  webVitalsReporter.reportVitals();
};

export const cleanupWebVitals = () => {
  webVitalsReporter.cleanup();
};

// Performance scoring
export const scoreWebVitals = (vitals: Partial<WebVitals>) => {
  const scores: Record<string, { score: number; rating: 'good' | 'needs-improvement' | 'poor' }> = {};

  // CLS scoring
  if (vitals.CLS !== undefined) {
    if (vitals.CLS <= 0.1) {
      scores.CLS = { score: 100, rating: 'good' };
    } else if (vitals.CLS <= 0.25) {
      scores.CLS = { score: 50, rating: 'needs-improvement' };
    } else {
      scores.CLS = { score: 0, rating: 'poor' };
    }
  }

  // FID scoring
  if (vitals.FID !== undefined) {
    if (vitals.FID <= 100) {
      scores.FID = { score: 100, rating: 'good' };
    } else if (vitals.FID <= 300) {
      scores.FID = { score: 50, rating: 'needs-improvement' };
    } else {
      scores.FID = { score: 0, rating: 'poor' };
    }
  }

  // FCP scoring
  if (vitals.FCP !== undefined) {
    if (vitals.FCP <= 1800) {
      scores.FCP = { score: 100, rating: 'good' };
    } else if (vitals.FCP <= 3000) {
      scores.FCP = { score: 50, rating: 'needs-improvement' };
    } else {
      scores.FCP = { score: 0, rating: 'poor' };
    }
  }

  // LCP scoring
  if (vitals.LCP !== undefined) {
    if (vitals.LCP <= 2500) {
      scores.LCP = { score: 100, rating: 'good' };
    } else if (vitals.LCP <= 4000) {
      scores.LCP = { score: 50, rating: 'needs-improvement' };
    } else {
      scores.LCP = { score: 0, rating: 'poor' };
    }
  }

  // TTFB scoring
  if (vitals.TTFB !== undefined) {
    if (vitals.TTFB <= 800) {
      scores.TTFB = { score: 100, rating: 'good' };
    } else if (vitals.TTFB <= 1800) {
      scores.TTFB = { score: 50, rating: 'needs-improvement' };
    } else {
      scores.TTFB = { score: 0, rating: 'poor' };
    }
  }

  return scores;
};

// Performance recommendations based on Web Vitals
export const getPerformanceRecommendations = (vitals: Partial<WebVitals>) => {
  const recommendations: string[] = [];

  if (vitals.CLS && vitals.CLS > 0.1) {
    recommendations.push('Reduce layout shifts by setting dimensions for images and videos');
    recommendations.push('Avoid inserting content above existing content');
  }

  if (vitals.FID && vitals.FID > 100) {
    recommendations.push('Reduce JavaScript execution time');
    recommendations.push('Break up long tasks using setTimeout or requestIdleCallback');
  }

  if (vitals.FCP && vitals.FCP > 1800) {
    recommendations.push('Optimize server response times');
    recommendations.push('Eliminate render-blocking resources');
  }

  if (vitals.LCP && vitals.LCP > 2500) {
    recommendations.push('Optimize images and videos');
    recommendations.push('Preload important resources');
    recommendations.push('Use a CDN for static assets');
  }

  if (vitals.TTFB && vitals.TTFB > 800) {
    recommendations.push('Optimize server response times');
    recommendations.push('Use a CDN');
    recommendations.push('Enable compression');
  }

  return recommendations;
};
