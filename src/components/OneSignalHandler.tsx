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
        const rawUrl = payload?.data?.targetUrl ?? payload?.data?.url ?? payload?.additionalData?.url ?? null;
        console.log('Raw notification URL:', rawUrl);

        const navigateToWebsite = () => {
          console.log('Opening website: https://ogonline.lovable.app/');
          window.open('https://ogonline.lovable.app/', '_blank');
        };

        // Always navigate to website when notification is clicked
        navigateToWebsite();
      } catch (error) {
        console.error('Error handling OneSignal push:', error);
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