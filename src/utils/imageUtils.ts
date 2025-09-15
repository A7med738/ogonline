/**
 * Utility functions for handling images with cache busting
 */

/**
 * Adds cache busting parameter to image URL to force refresh
 * @param imageUrl - The original image URL
 * @param forceRefresh - Whether to force refresh (default: true)
 * @returns URL with cache busting parameter
 */
export const getImageUrl = (imageUrl: string | null | undefined, forceRefresh: boolean = true): string => {
  if (!imageUrl || imageUrl === '/placeholder.svg') {
    return '/placeholder.svg';
  }

  // If it's a data URL (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Add cache busting parameter
  if (forceRefresh) {
    const separator = imageUrl.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    return `${imageUrl}${separator}v=${timestamp}`;
  }

  return imageUrl;
};

/**
 * Gets image URL with cache busting for Supabase storage
 * @param imageUrl - The Supabase storage URL
 * @param forceRefresh - Whether to force refresh (default: true)
 * @returns URL with cache busting parameter
 */
export const getSupabaseImageUrl = (imageUrl: string | null | undefined, forceRefresh: boolean = true): string => {
  if (!imageUrl || imageUrl === '/placeholder.svg') {
    return '/placeholder.svg';
  }

  // If it's a data URL (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // For Supabase URLs, add cache busting
  if (forceRefresh) {
    const separator = imageUrl.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    return `${imageUrl}${separator}t=${timestamp}`;
  }

  return imageUrl;
};

/**
 * Handles image loading error with fallback
 * @param event - The error event
 * @param fallbackSrc - Fallback image source (default: '/placeholder.svg')
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string = '/placeholder.svg') => {
  const target = event.currentTarget;
  if (target.src !== fallbackSrc) {
    target.src = fallbackSrc;
    // إضافة class للصورة الافتراضية
    target.classList.add('opacity-100');
  }
};

/**
 * Preloads an image to check if it exists
 * @param src - Image source URL
 * @returns Promise that resolves to true if image loads successfully
 */
export const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

/**
 * Gets optimized image URL for different screen sizes
 * @param imageUrl - Original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  imageUrl: string | null | undefined,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  if (!imageUrl || imageUrl === '/placeholder.svg') {
    return '/placeholder.svg';
  }

  // If it's a data URL (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // For Supabase storage, we can add transformation parameters
  if (imageUrl.includes('supabase')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('t', Date.now().toString()); // Cache busting

    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}${params.toString()}`;
  }

  // For other URLs, just add cache busting
  return getImageUrl(imageUrl, true);
};

/**
 * Creates a retry mechanism for image loading
 * @param src - Image source URL
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param delay - Delay between retries in ms (default: 1000)
 * @returns Promise that resolves to the image element
 */
export const loadImageWithRetry = (
  src: string, 
  maxRetries: number = 3, 
  delay: number = 1000
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const attemptLoad = () => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        retries++;
        if (retries < maxRetries) {
          setTimeout(attemptLoad, delay);
        } else {
          reject(new Error(`Failed to load image after ${maxRetries} attempts: ${src}`));
        }
      };
      
      img.src = src;
    };
    
    attemptLoad();
  });
};

/**
 * Preloads multiple images with retry mechanism
 * @param imageUrls - Array of image URLs to preload
 * @param maxRetries - Maximum number of retries per image
 * @returns Promise that resolves when all images are loaded or failed
 */
export const preloadImages = async (
  imageUrls: string[], 
  maxRetries: number = 2
): Promise<void> => {
  const loadPromises = imageUrls.map(url => 
    loadImageWithRetry(url, maxRetries).catch(error => {
      console.warn('Failed to preload image:', url, error);
      return null;
    })
  );
  
  await Promise.allSettled(loadPromises);
};
