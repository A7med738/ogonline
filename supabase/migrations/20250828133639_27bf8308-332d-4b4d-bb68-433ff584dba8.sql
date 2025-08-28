-- Ensure pg_net extension is available (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Recreate the notifier function with correct schema resolution
CREATE OR REPLACE FUNCTION public.notify_news_subscribers()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, net, extensions
AS $$
BEGIN
  -- Call the edge function to send emails
  PERFORM http_post(
    url := 'https://xjjczlhybgeslfiovkun.supabase.co/functions/v1/send-news-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamN6bGh5Ymdlc2xmaW92a3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUyODMsImV4cCI6MjA3MTk0MTI4M30.aqB0dFiAlwhomMITSeSLld9S7LeOh2oEf7kWnI47T4s"}'::jsonb,
    body := json_build_object(
      'newsId', NEW.id,
      'title', NEW.title,
      'summary', NEW.summary,
      'category', NEW.category,
      'imageUrl', NEW.image_url
    )::jsonb
  );
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger to ensure it's attached correctly
DROP TRIGGER IF EXISTS news_email_notification ON public.news;
CREATE TRIGGER news_email_notification
  AFTER INSERT ON public.news
  FOR EACH ROW 
  EXECUTE FUNCTION public.notify_news_subscribers();