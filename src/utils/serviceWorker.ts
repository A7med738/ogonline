// Service Worker registration for caching and performance
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              if (confirm('تحديث جديد متاح. هل تريد إعادة تحميل الصفحة؟')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Cache management utilities
export const cacheManager = {
  // Cache static assets
  async cacheStaticAssets() {
    if ('caches' in window) {
      const cache = await caches.open('static-v1');
      const assetsToCache = [
        '/',
        '/placeholder.svg',
        '/favicon.ico',
        // Add other static assets
      ];
      
      try {
        await cache.addAll(assetsToCache);
        console.log('Static assets cached successfully');
      } catch (error) {
        console.error('Failed to cache static assets:', error);
      }
    }
  },

  // Cache API responses
  async cacheApiResponse(url: string, response: Response) {
    if ('caches' in window) {
      const cache = await caches.open('api-v1');
      await cache.put(url, response.clone());
    }
  },

  // Get cached response
  async getCachedResponse(url: string): Promise<Response | undefined> {
    if ('caches' in window) {
      const cache = await caches.open('api-v1');
      return await cache.match(url);
    }
    return undefined;
  },

  // Clear old caches
  async clearOldCaches() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.startsWith('static-') || name.startsWith('api-')
      );
      
      await Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('Old caches cleared');
    }
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Measure page load time
  measurePageLoad() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Send to analytics if needed
        if (loadTime > 3000) {
          console.warn('Slow page load detected');
        }
      });
    }
  },

  // Measure API response times
  measureApiCall(url: string, startTime: number) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`API call to ${url} took ${duration}ms`);
    
    if (duration > 2000) {
      console.warn(`Slow API call detected: ${url}`);
    }
  }
};
