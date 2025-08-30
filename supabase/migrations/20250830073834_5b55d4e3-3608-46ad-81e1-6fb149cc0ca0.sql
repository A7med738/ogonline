-- Remove the insecure database trigger and function with CASCADE
DROP FUNCTION IF EXISTS public.notify_news_subscribers() CASCADE;