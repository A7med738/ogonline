-- إنشاء bucket للتخزين العام
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public',
  'public',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- إنشاء سياسات RLS للتخزين
CREATE POLICY "Public can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'public' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'public' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'public' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- إنشاء مجلد للخدمات الجديدة
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (
  'public',
  'city-services/',
  auth.uid(),
  '{"mimetype": "folder"}'::jsonb
) ON CONFLICT (bucket_id, name) DO NOTHING;
