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
        const rawUrl = payload?.data?.url ?? payload?.additionalData?.url ?? null;
        console.log('Raw notification URL:', rawUrl);

        const navigateToNews = (newsId: string | null) => {
          if (newsId) {
            console.log('Navigating to news id:', newsId);
            navigate(`/news?id=${newsId}`);
          } else {
            console.warn('Missing news id, navigating to /news');
            navigate('/news');
          }
        };

        const extractNewsId = (u: string | null): string | null => {
          if (!u) return null;
          try {
            if (u.startsWith('ogonline://')) {
              // custom scheme: ogonline://news?id=UUID
              const afterScheme = u.replace('ogonline://', ''); // e.g. "news?id=..."
              const [hostAndPath, queryString] = afterScheme.split('?');
              const params = new URLSearchParams(queryString || '');
              if (hostAndPath === 'news' || hostAndPath === '/news') {
                return params.get('id');
              }
            } else {
              const url = new URL(u);
              if (url.pathname === '/news') {
                return url.searchParams.get('id');
              }
            }
          } catch (e) {
            console.warn('URL parse failed, trying regex fallback', e);
            const match = u.match(/[?&]id=([^&]+)/);
            return match ? decodeURIComponent(match[1]) : null;
          }
          return null;
        };

        const newsId = extractNewsId(rawUrl);
        if (newsId) {
          navigateToNews(newsId);
        } else {
          console.warn('No valid news id found in notification payload');
          navigate('/news');
        }
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