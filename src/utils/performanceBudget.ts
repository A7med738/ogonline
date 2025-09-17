// Performance budget monitoring and enforcement
import React from 'react';

export interface PerformanceBudget {
  bundleSize: number; // in bytes
  renderTime: number; // in milliseconds
  memoryUsage: number; // in MB
  cacheHitRate: number; // percentage
  errorRate: number; // percentage
}

export interface PerformanceMetrics {
  bundleSize: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
  timestamp: number;
}

export class PerformanceBudgetManager {
  private static instance: PerformanceBudgetManager;
  private budget: PerformanceBudget;
  private metrics: PerformanceMetrics[] = [];
  private violations: Array<{ metric: string; value: number; budget: number; timestamp: number }> = [];

  constructor() {
    this.budget = {
      bundleSize: 250000, // 250KB
      renderTime: 16, // 16ms for 60fps
      memoryUsage: 50, // 50MB
      cacheHitRate: 80, // 80%
      errorRate: 5, // 5%
    };
  }

  static getInstance(): PerformanceBudgetManager {
    if (!PerformanceBudgetManager.instance) {
      PerformanceBudgetManager.instance = new PerformanceBudgetManager();
    }
    return PerformanceBudgetManager.instance;
  }

  // Set performance budget
  setBudget(budget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...budget };
  }

  // Get current budget
  getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  // Record performance metrics
  recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    const fullMetrics: PerformanceMetrics = {
      bundleSize: 0,
      renderTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      errorRate: 0,
      timestamp: Date.now(),
      ...metrics,
    };

    this.metrics.push(fullMetrics);

    // Check for budget violations
    this.checkViolations(fullMetrics);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Check for budget violations
  private checkViolations(metrics: PerformanceMetrics): void {
    const checks = [
      { metric: 'bundleSize', value: metrics.bundleSize, budget: this.budget.bundleSize, operator: '>' },
      { metric: 'renderTime', value: metrics.renderTime, budget: this.budget.renderTime, operator: '>' },
      { metric: 'memoryUsage', value: metrics.memoryUsage, budget: this.budget.memoryUsage, operator: '>' },
      { metric: 'cacheHitRate', value: metrics.cacheHitRate, budget: this.budget.cacheHitRate, operator: '<' },
      { metric: 'errorRate', value: metrics.errorRate, budget: this.budget.errorRate, operator: '>' },
    ];

    checks.forEach(({ metric, value, budget, operator }) => {
      const isViolation = operator === '>' ? value > budget : value < budget;
      
      if (isViolation) {
        this.violations.push({
          metric,
          value,
          budget,
          timestamp: Date.now(),
        });

        console.warn(`Performance budget violation: ${metric} = ${value} (budget: ${budget})`);
      }
    });
  }

  // Get current metrics
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  // Get average metrics
  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        bundleSize: 0,
        renderTime: 0,
        memoryUsage: 0,
        cacheHitRate: 0,
        errorRate: 0,
        timestamp: Date.now(),
      };
    }

    const sum = this.metrics.reduce((acc, metric) => ({
      bundleSize: acc.bundleSize + metric.bundleSize,
      renderTime: acc.renderTime + metric.renderTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
      errorRate: acc.errorRate + metric.errorRate,
      timestamp: Date.now(),
    }), {
      bundleSize: 0,
      renderTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      errorRate: 0,
      timestamp: 0,
    });

    const count = this.metrics.length;
    return {
      bundleSize: sum.bundleSize / count,
      renderTime: sum.renderTime / count,
      memoryUsage: sum.memoryUsage / count,
      cacheHitRate: sum.cacheHitRate / count,
      errorRate: sum.errorRate / count,
      timestamp: Date.now(),
    };
  }

  // Get violations
  getViolations(): Array<{ metric: string; value: number; budget: number; timestamp: number }> {
    return [...this.violations];
  }

  // Get violation rate
  getViolationRate(): number {
    if (this.metrics.length === 0) return 0;
    return (this.violations.length / this.metrics.length) * 100;
  }

  // Get performance score (0-100)
  getPerformanceScore(): number {
    const current = this.getCurrentMetrics();
    if (!current) return 0;

    const scores = [
      this.getScore(current.bundleSize, this.budget.bundleSize, false), // lower is better
      this.getScore(current.renderTime, this.budget.renderTime, false), // lower is better
      this.getScore(current.memoryUsage, this.budget.memoryUsage, false), // lower is better
      this.getScore(current.cacheHitRate, this.budget.cacheHitRate, true), // higher is better
      this.getScore(current.errorRate, this.budget.errorRate, false), // lower is better
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  // Get score for a metric (0-100)
  private getScore(value: number, budget: number, higherIsBetter: boolean): number {
    if (higherIsBetter) {
      return Math.min(100, (value / budget) * 100);
    } else {
      return Math.max(0, 100 - ((value / budget) * 100));
    }
  }

  // Get recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const current = this.getCurrentMetrics();
    
    if (!current) return recommendations;

    if (current.bundleSize > this.budget.bundleSize) {
      recommendations.push('Reduce bundle size by implementing code splitting');
      recommendations.push('Remove unused dependencies');
      recommendations.push('Use dynamic imports for heavy components');
    }

    if (current.renderTime > this.budget.renderTime) {
      recommendations.push('Optimize component rendering with React.memo()');
      recommendations.push('Use useMemo() for expensive calculations');
      recommendations.push('Implement virtual scrolling for large lists');
    }

    if (current.memoryUsage > this.budget.memoryUsage) {
      recommendations.push('Implement memory cleanup in useEffect');
      recommendations.push('Use weak references for large objects');
      recommendations.push('Clear caches periodically');
    }

    if (current.cacheHitRate < this.budget.cacheHitRate) {
      recommendations.push('Improve caching strategy');
      recommendations.push('Use React Query for data caching');
      recommendations.push('Implement service worker caching');
    }

    if (current.errorRate > this.budget.errorRate) {
      recommendations.push('Add error boundaries');
      recommendations.push('Implement retry mechanisms');
      recommendations.push('Add better error handling');
    }

    return recommendations;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
    this.violations = [];
  }

  // Export metrics for analysis
  exportMetrics(): string {
    return JSON.stringify({
      budget: this.budget,
      metrics: this.metrics,
      violations: this.violations,
      performanceScore: this.getPerformanceScore(),
      recommendations: this.getRecommendations(),
    }, null, 2);
  }
}

// Export singleton instance
export const performanceBudget = PerformanceBudgetManager.getInstance();

// React hook for performance budget monitoring
export const usePerformanceBudget = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [violations, setViolations] = React.useState<Array<{ metric: string; value: number; budget: number; timestamp: number }>>([]);
  const [performanceScore, setPerformanceScore] = React.useState<number>(0);

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceBudget.getCurrentMetrics());
      setViolations(performanceBudget.getViolations());
      setPerformanceScore(performanceBudget.getPerformanceScore());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    violations,
    performanceScore,
    budget: performanceBudget.getBudget(),
    recommendations: performanceBudget.getRecommendations(),
  };
};

// Performance budget presets
export const performanceBudgetPresets = {
  // Conservative budget for high-performance requirements
  conservative: {
    bundleSize: 200000, // 200KB
    renderTime: 12, // 12ms
    memoryUsage: 40, // 40MB
    cacheHitRate: 85, // 85%
    errorRate: 3, // 3%
  },

  // Balanced budget for typical applications
  balanced: {
    bundleSize: 250000, // 250KB
    renderTime: 16, // 16ms
    memoryUsage: 50, // 50MB
    cacheHitRate: 80, // 80%
    errorRate: 5, // 5%
  },

  // Relaxed budget for development or low-performance requirements
  relaxed: {
    bundleSize: 500000, // 500KB
    renderTime: 33, // 33ms
    memoryUsage: 100, // 100MB
    cacheHitRate: 70, // 70%
    errorRate: 10, // 10%
  },
};

// Apply performance budget preset
export const applyPerformanceBudgetPreset = (preset: keyof typeof performanceBudgetPresets): void => {
  const budget = performanceBudgetPresets[preset];
  performanceBudget.setBudget(budget);
};
