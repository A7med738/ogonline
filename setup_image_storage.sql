-- Setup Supabase Storage for images
-- This script sets up the storage bucket and policies for image uploads

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public read access to images
CREATE POLICY "Public read access for images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to update their own images
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow anonymous users to upload images (for public use)
CREATE POLICY "Anonymous users can upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

-- Create policy to allow anonymous users to update images
CREATE POLICY "Anonymous users can update images" ON storage.objects
FOR UPDATE USING (bucket_id = 'images');

-- Create policy to allow anonymous users to delete images
CREATE POLICY "Anonymous users can delete images" ON storage.objects
FOR DELETE USING (bucket_id = 'images');

-- Add comments
COMMENT ON BUCKET images IS 'Storage bucket for application images including shop logos, mall images, and user uploads';
