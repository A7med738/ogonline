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
          // Security: Only allow specific deep link patterns to prevent malicious redirects
          if (targetUrl.startsWith('ogonline://')) {
            try {
              const url = new URL(targetUrl);
              // Only allow navigation to specific paths
              if (url.pathname === '/news' && url.searchParams.get('id')) {
                const newsId = url.searchParams.get('id');
                console.log('Navigating to news:', newsId);
                navigate(`/news?id=${newsId}`);
                return;
              }
            } catch (urlError) {
              console.error('Invalid deep link URL:', urlError);
            }
          }
          console.warn('Unsafe URL blocked:', targetUrl);
        }
        
        // Fallback to news page for any unhandled cases
        console.log('Falling back to news page');
        navigate('/news');
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