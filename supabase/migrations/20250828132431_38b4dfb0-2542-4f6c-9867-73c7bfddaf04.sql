-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger news email notification
CREATE OR REPLACE FUNCTION public.notify_news_subscribers()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function to send emails
  PERFORM net.http_post(
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

-- Create trigger to send email when news is inserted
CREATE TRIGGER news_email_notification
  AFTER INSERT ON public.news
  FOR EACH ROW 
  EXECUTE FUNCTION public.notify_news_subscribers();