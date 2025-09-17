import React, { useEffect } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
}

export function usePreload() {
  // Preload critical images
  const preloadImage = (src: string, options: PreloadOptions = {}) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (options.priority) {
      link.setAttribute('fetchpriority', options.priority);
    }
    
    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }
    
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  };

  // Preload critical fonts
  const preloadFont = (src: string, type: string = 'font/woff2') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = src;
    link.type = type;
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  };

  // Preload critical scripts
  const preloadScript = (src: string, options: PreloadOptions = {}) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    
    if (options.priority) {
      link.setAttribute('fetchpriority', options.priority);
    }
    
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  };

  // Preload critical stylesheets
  const preloadStyle = (src: string, options: PreloadOptions = {}) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = src;
    
    if (options.priority) {
      link.setAttribute('fetchpriority', options.priority);
    }
    
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  };

  // Preload page resources
  const preloadPage = (pagePath: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = pagePath;
    
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  };

  return {
    preloadImage,
    preloadFont,
    preloadScript,
    preloadStyle,
    preloadPage,
  };
}

// Hook for preloading critical resources on app start
export function useCriticalPreload() {
  const { preloadImage, preloadFont } = usePreload();

  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/placeholder.svg',
      '/favicon.ico',
    ];

    const cleanupFunctions = criticalImages.map(src => 
      preloadImage(src, { priority: 'high' })
    );

    // Preload critical fonts if any
    // const criticalFonts = [
    //   '/fonts/inter-var.woff2',
    // ];
    // 
    // const fontCleanup = criticalFonts.map(src => 
    //   preloadFont(src)
    // );

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      // fontCleanup.forEach(cleanup => cleanup());
    };
  }, [preloadImage, preloadFont]);
}

// Hook for preloading next page resources
export function useNextPagePreload() {
  const { preloadPage } = usePreload();

  useEffect(() => {
    // Preload likely next pages based on user behavior
    const likelyPages = [
      '/search',
      '/news',
      '/city-services',
      '/educational-services',
      '/medical-services',
    ];

    const cleanupFunctions = likelyPages.map(page => 
      preloadPage(page)
    );

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [preloadPage]);
}
