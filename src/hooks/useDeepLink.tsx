import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parseDeepLink, DEEP_LINK_PATHS } from '@/utils/deepLinkUtils';

export const useDeepLink = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleDeepLink = () => {
      // Check if running in Capacitor
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
        // Handle incoming deep link
        const handleUrl = (url: string) => {
          console.log('Deep link received:', url);
          
          if (url.includes('auth/callback')) {
            // Get auth session after OAuth redirect
            supabase.auth.getSession().then(({ data: { session }, error }) => {
              if (error) {
                toast({
                  title: "خطأ في المصادقة",
                  description: "حدث خطأ أثناء تسجيل الدخول",
                  variant: "destructive"
                });
                navigate('/auth');
              } else if (session) {
                toast({
                  title: "تم تسجيل الدخول بنجاح!",
                  description: "مرحباً بك في التطبيق",
                });
                navigate('/');
              }
            });
          } else if (url.startsWith('ogonline://')) {
            // Handle deep link using utility function
            const { path, params } = parseDeepLink(url);
            console.log('Parsed deep link:', { path, params });
            
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
              const urlObj = new URL(url);
              const path = urlObj.pathname + urlObj.search + urlObj.hash;
              console.log('Regular URL detected, navigating to:', path);
              navigate(path);
            } catch (error) {
              console.error('Invalid URL format:', url);
              navigate('/');
            }
          }
        };

        // Listen for app URL open events
        const setupDeepLinkListener = async () => {
          try {
            const { App } = await import('@capacitor/app');
            
            App.addListener('appUrlOpen', (event: { url: string }) => {
              handleUrl(event.url);
            });

            // Handle the URL if the app was opened with one
            const result = await App.getLaunchUrl();
            if (result?.url) {
              handleUrl(result.url);
            }
          } catch (error) {
            console.error('Error setting up deep link listener:', error);
          }
        };

        setupDeepLinkListener();
      }
    };

    handleDeepLink();
  }, [navigate, toast]);
};