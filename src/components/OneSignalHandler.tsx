import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
          // Extract the path from the full URL if it's a full URL
          const url = new URL(targetUrl);
          const path = url.pathname + url.search + url.hash;
          
          console.log('Navigating to:', path);
          navigate(path);
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