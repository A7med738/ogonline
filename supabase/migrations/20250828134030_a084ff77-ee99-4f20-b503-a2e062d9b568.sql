-- Create table to track user's last visit to news page
CREATE TABLE public.user_news_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  last_visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_news_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for user news activity
CREATE POLICY "Users can view their own news activity" 
ON public.user_news_activity 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own news activity" 
ON public.user_news_activity 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news activity" 
ON public.user_news_activity 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_user_news_activity_updated_at
BEFORE UPDATE ON public.user_news_activity
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for news table
ALTER TABLE public.news REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.news;

-- Enable realtime for user news activity
ALTER TABLE public.user_news_activity REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_news_activity;