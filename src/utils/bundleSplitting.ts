// Bundle splitting utilities for better performance
import React, { lazy, ComponentType } from 'react';

// Lazy load components with error boundaries
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(importFunc);

  return function WrappedComponent(props: React.ComponentProps<T>) {
    const FallbackElement = fallback ? React.createElement(fallback) : React.createElement('div', {}, 'Loading...');
    
    return React.createElement(React.Suspense, 
      { fallback: FallbackElement },
      React.createElement(LazyComponent, props)
    );
  };
}

// Route-based code splitting
export const routeComponents = {
  // Public pages
  Index: createLazyComponent(() => import('@/pages/Index')),
  Search: createLazyComponent(() => import('@/pages/Search')),
  News: createLazyComponent(() => import('@/pages/News')),
  Police: createLazyComponent(() => import('@/pages/Police')),
  City: createLazyComponent(() => import('@/pages/City')),
  Business: createLazyComponent(() => import('@/pages/Business')),
  Jobs: createLazyComponent(() => import('@/pages/Jobs')),
  Auth: createLazyComponent(() => import('@/pages/Auth')),
  Profile: createLazyComponent(() => import('@/pages/Profile')),

  // Service pages
  EducationalServices: createLazyComponent(() => import('@/pages/EducationalServices')),
  MedicalServices: createLazyComponent(() => import('@/pages/MedicalServices')),
  CityMalls: createLazyComponent(() => import('@/pages/CityMalls')),
  WorshipPlaces: createLazyComponent(() => import('@/pages/WorshipPlaces')),

  // Admin pages (heavy, should be lazy loaded)
  Admin: createLazyComponent(() => import('@/pages/Admin')),
  EducationalServicesManagement: createLazyComponent(() => import('@/pages/admin/EducationalServicesManagement')),
  MedicalServicesManagement: createLazyComponent(() => import('@/pages/admin/MedicalServicesManagement')),
  CityServicesManagement: createLazyComponent(() => import('@/pages/admin/CityServicesManagement')),
  PharmaciesManagement: createLazyComponent(() => import('@/pages/admin/PharmaciesManagement')),
  HotelsManagement: createLazyComponent(() => import('@/pages/admin/HotelsManagement')),
  GasStationsManagement: createLazyComponent(() => import('@/pages/admin/GasStationsManagement')),
  GasCompanyManagement: createLazyComponent(() => import('@/pages/admin/GasCompanyManagement')),
  ElectricityCompanyManagement: createLazyComponent(() => import('@/pages/admin/ElectricityCompanyManagement')),

  // Heavy components
  FloatingChat: createLazyComponent(() => import('@/components/FloatingChat')),
};

// Feature-based code splitting
export const featureComponents = {
  // Search features
  search: {
    SearchPage: createLazyComponent(() => import('@/pages/Search')),
    SearchResults: createLazyComponent(() => import('@/components/SearchResults')),
  },

  // Admin features
  admin: {
    AdminDashboard: createLazyComponent(() => import('@/pages/Admin')),
    UserManagement: createLazyComponent(() => import('@/components/UserManagement')),
    ContentManagement: createLazyComponent(() => import('@/components/ContentManagement')),
  },


  // Educational services features
  educational: {
    SchoolsList: createLazyComponent(() => import('@/components/SchoolsList')),
    UniversitiesList: createLazyComponent(() => import('@/components/UniversitiesList')),
    TeachersList: createLazyComponent(() => import('@/components/TeachersList')),
  },

  // Medical services features
  medical: {
    HospitalsList: createLazyComponent(() => import('@/components/HospitalsList')),
    ClinicsList: createLazyComponent(() => import('@/components/ClinicsList')),
    PharmaciesList: createLazyComponent(() => import('@/components/PharmaciesList')),
  },
};

// Dynamic imports with error handling
export async function dynamicImport<T>(
  importFunc: () => Promise<{ default: T }>,
  retries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const module = await importFunc();
      return module.default;
    } catch (error) {
      console.error(`Dynamic import attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw new Error(`Failed to load module after ${retries} attempts`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Dynamic import failed');
}

// Preload components for better performance
export function preloadComponent<T>(
  importFunc: () => Promise<{ default: T }>
): Promise<T> {
  return importFunc().then(module => module.default);
}

// Preload route components
export function preloadRoute(routeName: keyof typeof routeComponents): Promise<void> {
  const component = routeComponents[routeName];
  if (component) {
    return preloadComponent(() => import(`@/pages/${routeName}`));
  }
  return Promise.resolve();
}

// Preload feature components
export function preloadFeature(
  featureName: keyof typeof featureComponents,
  componentName: string
): Promise<void> {
  const feature = featureComponents[featureName];
  if (feature && componentName in feature) {
    return preloadComponent(() => import(`@/components/${componentName}`));
  }
  return Promise.resolve();
}

// Bundle analysis
export const bundleAnalyzer = {
  // Get bundle size information
  getBundleInfo(): Promise<{
    totalSize: number;
    chunkSizes: Record<string, number>;
    gzippedSize: number;
  }> {
    return new Promise((resolve) => {
      // This would be implemented with webpack-bundle-analyzer
      // For now, return mock data
      resolve({
        totalSize: 0,
        chunkSizes: {},
        gzippedSize: 0,
      });
    });
  },

  // Check if component should be lazy loaded
  shouldLazyLoad(componentName: string, size: number): boolean {
    const heavyComponents = [
      'Admin',
      'FloatingChat',
      'EducationalServicesManagement',
      'MedicalServicesManagement',
    ];

    return heavyComponents.includes(componentName) || size > 50000; // 50KB
  },

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    recommendations.push('Use lazy loading for admin components');
    recommendations.push('Split large components into smaller chunks');
    recommendations.push('Use dynamic imports for heavy features');
    recommendations.push('Implement code splitting for routes');

    return recommendations;
  },
};

// Performance monitoring for bundle splitting
export const bundlePerformance = {
  // Track component load times
  trackComponentLoad(componentName: string, loadTime: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component ${componentName} loaded in ${loadTime}ms`);
    }
  },

  // Track bundle size
  trackBundleSize(bundleName: string, size: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Bundle ${bundleName} size: ${size} bytes`);
    }
  },

  // Get performance metrics
  getMetrics(): {
    componentLoadTimes: Record<string, number>;
    bundleSizes: Record<string, number>;
  } {
    return {
      componentLoadTimes: {},
      bundleSizes: {},
    };
  },
};