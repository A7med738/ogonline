import React, { Suspense, ComponentType, lazy } from 'react';
import SkeletonLoader from './SkeletonLoader';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorBoundary?: boolean;
}

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <SkeletonLoader variant="card" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Lazy load pages
export const LazyIndex = withLazyLoading(() => import('@/pages/Index'));
export const LazySearch = withLazyLoading(() => import('@/pages/Search'));
export const LazyNews = withLazyLoading(() => import('@/pages/News'));
export const LazyPolice = withLazyLoading(() => import('@/pages/Police'));
export const LazyCity = withLazyLoading(() => import('@/pages/City'));
export const LazyBusiness = withLazyLoading(() => import('@/pages/Business'));
export const LazyJobs = withLazyLoading(() => import('@/pages/Jobs'));
export const LazyAuth = withLazyLoading(() => import('@/pages/Auth'));
export const LazyProfile = withLazyLoading(() => import('@/pages/Profile'));

// Lazy load admin pages
export const LazyAdmin = withLazyLoading(() => import('@/pages/Admin'));
export const LazyEducationalServicesManagement = withLazyLoading(
  () => import('@/pages/admin/EducationalServicesManagement')
);
export const LazyMedicalServicesManagement = withLazyLoading(
  () => import('@/pages/admin/MedicalServicesManagement')
);
export const LazyCityServicesManagement = withLazyLoading(
  () => import('@/pages/admin/CityServicesManagement')
);

// Lazy load service pages
export const LazyEducationalServices = withLazyLoading(
  () => import('@/pages/EducationalServices')
);
export const LazyMedicalServices = withLazyLoading(
  () => import('@/pages/MedicalServices')
);
export const LazyRealEstate = withLazyLoading(
  () => import('@/pages/RealEstate')
);
export const LazyCityMalls = withLazyLoading(
  () => import('@/pages/CityMalls')
);

// Lazy load heavy components
export const LazyFloatingChat = withLazyLoading(
  () => import('@/components/FloatingChat')
);

// Generic lazy component wrapper
export const LazyComponent: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  return (
    <Suspense fallback={fallback || <SkeletonLoader variant="card" />}>
      {children}
    </Suspense>
  );
};
