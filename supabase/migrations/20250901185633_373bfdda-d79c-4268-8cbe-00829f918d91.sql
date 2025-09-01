-- Create news media table to support multiple images and videos
CREATE TABLE IF NOT EXISTS public.news_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  file_name TEXT,
  file_size INTEGER,
  order_priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view news media" 
ON public.news_media 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage news media" 
ON public.news_media 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-videos', 'news-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for videos
CREATE POLICY "Public can view news videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-videos');

CREATE POLICY "Admins can upload news videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update news videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-videos' AND has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for timestamp updates
CREATE TRIGGER update_news_media_updated_at
BEFORE UPDATE ON public.news_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_news_media_news_id ON public.news_media(news_id);
CREATE INDEX idx_news_media_order ON public.news_media(news_id, order_priority);