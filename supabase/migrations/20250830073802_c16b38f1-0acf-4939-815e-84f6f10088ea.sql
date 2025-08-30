-- Remove the insecure database trigger that uses hardcoded Authorization token
DROP TRIGGER IF EXISTS notify_news_subscribers_trigger ON public.news;

-- Remove the trigger function as well since it's insecure
DROP FUNCTION IF EXISTS public.notify_news_subscribers();

-- Update send-news-email function to require admin authentication
-- This will be handled in the config.toml update