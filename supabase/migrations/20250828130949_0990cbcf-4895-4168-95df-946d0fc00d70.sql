-- Add image_url column to news table
ALTER TABLE public.news ADD COLUMN image_url TEXT;

-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-images', 'news-images', true);

-- Create storage policies for news images
CREATE POLICY "Anyone can view news images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

CREATE POLICY "Admins can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update news images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'::app_role));