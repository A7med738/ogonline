import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseDeepLink } from '@/utils/deepLinkUtils';

declare global {
  interface Window {
    median_onesignal_push_opened?: (payload: any) => void;
  }
}

export const OneSignalHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Define the OneSignal push opened handler for Median
    window.median_onesignal_push_opened = (payload) => {
      console.log('OneSignal push opened:', payload);
      
      try {
        // Extract URL from notification data
        let targetUrl = null;
        
        if (payload?.data?.url) {
          targetUrl = payload.data.url;
        } else if (payload?.additionalData?.url) {
          targetUrl = payload.additionalData.url;
        }
        
        if (targetUrl) {
          // Check if it's a deep link
          if (targetUrl.startsWith('ogonline://')) {
            // Handle deep link using utility function
            const { path, params } = parseDeepLink(targetUrl);
            console.log('Deep link detected:', { path, params });
            
            // Build navigation path with parameters
            let navigationPath = `/${path}`;
            if (Object.keys(params).length > 0) {
              const searchParams = new URLSearchParams(params);
              navigationPath += `?${searchParams.toString()}`;
            }
            
            console.log('Navigating to:', navigationPath);
            navigate(navigationPath);
          } else {
            // Handle regular URL
            try {
              const url = new URL(targetUrl);
              const path = url.pathname + url.search + url.hash;
              console.log('Regular URL detected, navigating to:', path);
              navigate(path);
            } catch (error) {
              console.error('Invalid URL format:', targetUrl);
              navigate('/news');
            }
          }
        } else {
          console.warn('No URL found in notification payload');
          // Fallback to news page
          navigate('/news');
        }
      } catch (error) {
        console.error('Error handling OneSignal push:', error);
        // Fallback to news page
        navigate('/news');
      }
    };

    // Cleanup function
    return () => {
      if (window.median_onesignal_push_opened) {
        delete window.median_onesignal_push_opened;
      }
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};