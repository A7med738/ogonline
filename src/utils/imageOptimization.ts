// Image optimization utilities
import React from 'react';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  lazy?: boolean;
  placeholder?: string;
}

export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private imageCache = new Map<string, string>();
  private loadingImages = new Set<string>();

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  // Optimize image URL for different use cases
  optimizeImageUrl(
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ): string {
    if (!originalUrl || originalUrl === '/placeholder.svg') {
      return options.placeholder || '/placeholder.svg';
    }

    // If it's a data URL, return as is
    if (originalUrl.startsWith('data:')) {
      return originalUrl;
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(originalUrl, options);
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    let optimizedUrl = originalUrl;

    // For Supabase storage, add transformation parameters
    if (originalUrl.includes('supabase')) {
      const params = new URLSearchParams();
      
      if (options.width) params.append('width', options.width.toString());
      if (options.height) params.append('height', options.height.toString());
      if (options.quality) params.append('quality', options.quality.toString());
      if (options.format) params.append('format', options.format);
      
      // Add cache busting
      params.append('t', Date.now().toString());

      const separator = originalUrl.includes('?') ? '&' : '?';
      optimizedUrl = `${originalUrl}${separator}${params.toString()}`;
    } else {
      // For other URLs, add basic cache busting
      const separator = originalUrl.includes('?') ? '&' : '?';
      optimizedUrl = `${originalUrl}${separator}v=${Date.now()}`;
    }

    // Cache the optimized URL
    this.imageCache.set(cacheKey, optimizedUrl);

    return optimizedUrl;
  }

  // Preload images for better performance
  async preloadImages(
    urls: string[],
    options: ImageOptimizationOptions = {}
  ): Promise<string[]> {
    const optimizedUrls = urls.map(url => this.optimizeImageUrl(url, options));
    
    const loadPromises = optimizedUrls.map(url => this.loadImage(url));
    
    try {
      await Promise.all(loadPromises);
      return optimizedUrls;
    } catch (error) {
      console.error('Error preloading images:', error);
      return optimizedUrls;
    }
  }

  // Load single image with retry
  private async loadImage(url: string, maxRetries: number = 3): Promise<void> {
    if (this.loadingImages.has(url)) {
      return;
    }

    this.loadingImages.add(url);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            this.loadingImages.delete(url);
            resolve();
          };
          
          img.onerror = () => {
            if (attempt === maxRetries) {
              this.loadingImages.delete(url);
              reject(new Error(`Failed to load image after ${maxRetries} attempts: ${url}`));
            } else {
              // Retry after delay
              setTimeout(() => {
                img.src = url;
              }, 1000 * attempt);
            }
          };
          
          img.src = url;
        });
        
        return; // Success
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }

  // Generate responsive image srcset
  generateSrcSet(
    baseUrl: string,
    widths: number[],
    options: Omit<ImageOptimizationOptions, 'width'> = {}
  ): string {
    return widths
      .map(width => {
        const optimizedUrl = this.optimizeImageUrl(baseUrl, { ...options, width });
        return `${optimizedUrl} ${width}w`;
      })
      .join(', ');
  }

  // Generate sizes attribute for responsive images
  generateSizes(breakpoints: Array<{ media: string; size: string }>): string {
    return breakpoints
      .map(({ media, size }) => `(${media}) ${size}`)
      .join(', ') + ', 100vw';
  }

  // Get optimal image format based on browser support
  getOptimalFormat(): 'webp' | 'jpeg' | 'png' | 'avif' {
    if (typeof window === 'undefined') return 'jpeg';

    // Check for AVIF support
    if (this.supportsFormat('avif')) return 'avif';
    
    // Check for WebP support
    if (this.supportsFormat('webp')) return 'webp';
    
    // Fallback to JPEG
    return 'jpeg';
  }

  // Check if browser supports specific format
  private supportsFormat(format: string): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL(`image/${format}`).indexOf(`image/${format}`) === 5;
  }

  // Get optimal quality based on image size and use case
  getOptimalQuality(
    width: number,
    height: number,
    useCase: 'thumbnail' | 'card' | 'hero' | 'full' = 'card'
  ): number {
    const pixelCount = width * height;
    
    switch (useCase) {
      case 'thumbnail':
        return pixelCount < 10000 ? 90 : 80;
      case 'card':
        return pixelCount < 100000 ? 85 : 75;
      case 'hero':
        return pixelCount < 500000 ? 80 : 70;
      case 'full':
        return pixelCount < 1000000 ? 75 : 65;
      default:
        return 80;
    }
  }

  // Clear cache
  clearCache(): void {
    this.imageCache.clear();
    this.loadingImages.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; loading: number } {
    return {
      size: this.imageCache.size,
      loading: this.loadingImages.size,
    };
  }

  private generateCacheKey(url: string, options: ImageOptimizationOptions): string {
    return `${url}:${JSON.stringify(options)}`;
  }
}

// Export singleton instance
export const imageOptimizer = ImageOptimizer.getInstance();

// React hook for optimized images
export const useOptimizedImage = (
  url: string,
  options: ImageOptimizationOptions = {}
) => {
  const [optimizedUrl, setOptimizedUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!url) {
      setOptimizedUrl(options.placeholder || '/placeholder.svg');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const optimized = imageOptimizer.optimizeImageUrl(url, options);
      setOptimizedUrl(optimized);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setOptimizedUrl(options.placeholder || '/placeholder.svg');
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  return { optimizedUrl, loading, error };
};

// Utility functions
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
};

export const isImageUrl = (url: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url);
};

export const getImageAspectRatio = (width: number, height: number): number => {
  return width / height;
};

export const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = maxWidth;
  let height = maxWidth / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
};
