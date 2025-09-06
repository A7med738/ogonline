-- Fix the INSERT policies for news media uploads
DROP POLICY IF EXISTS "Admins can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload news videos" ON storage.objects;

-- Create proper INSERT policies for news media
CREATE POLICY "Admins can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload news videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-videos' AND has_role(auth.uid(), 'admin'));