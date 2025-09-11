/**
 * Deep Link utilities for handling app navigation
 */

export const DEEP_LINK_SCHEME = 'ogonline://';

/**
 * Generate a deep link URL for the app
 */
export const generateDeepLink = (path: string, params?: Record<string, string>): string => {
  let url = `${DEEP_LINK_SCHEME}${path}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

/**
 * Generate a web fallback URL with deep link fallback
 */
export const generateWebUrl = (path: string, params?: Record<string, string>): string => {
  // Check if running in mobile app context
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    return generateDeepLink(path, params);
  }
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://3e2213ca-bd16-4ff2-8f69-45d0069c6783.lovableproject.com';
  let url = `${baseUrl}/${path}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

/**
 * Generate a universal URL that works for both app and web
 */
export const generateUniversalUrl = (path: string, params?: Record<string, string>): string => {
  // Check if running in mobile app
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    return generateDeepLink(path, params);
  } else {
    return generateWebUrl(path, params);
  }
};

/**
 * Parse a deep link URL and extract path and parameters
 */
export const parseDeepLink = (url: string): { path: string; params: Record<string, string> } => {
  if (url.startsWith(DEEP_LINK_SCHEME)) {
    const urlWithoutScheme = url.replace(DEEP_LINK_SCHEME, '');
    const [path, queryString] = urlWithoutScheme.split('?');
    const params: Record<string, string> = {};
    
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    
    return { path, params };
  }
  
  return { path: '', params: {} };
};

/**
 * Check if the current environment supports deep links
 */
export const isDeepLinkSupported = (): boolean => {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
};

/**
 * Common deep link paths
 */
export const DEEP_LINK_PATHS = {
  HOME: '',
  NEWS: 'news',
  JOBS: 'jobs',
  LOST_AND_FOUND: 'lost-and-found',
  POLICE: 'police',
  BUSINESS: 'business',
  EMAIL_CONFIRMATION: 'email-confirmation',
  AUTH: 'auth',
  PROFILE: 'profile',
  CITY_SERVICES: 'city-services'
} as const;
