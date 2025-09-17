-- Complete database setup for image upload and google maps
-- Run this in Supabase SQL Editor

-- 1. Create images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- 3. Create policies for images bucket
CREATE POLICY "Public read access for images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- 4. Add google_maps_url column to all service tables
-- Medical Services Tables
ALTER TABLE hospitals 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

ALTER TABLE health_units
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

ALTER TABLE medical_centers
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Educational Services Tables
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

ALTER TABLE nurseries
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

ALTER TABLE educational_centers
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

ALTER TABLE universities
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- 5. Make level column optional in hospitals table
-- First, fix existing data
UPDATE hospitals 
SET level = 'غير محدد' 
WHERE level IS NULL 
   OR level NOT IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد')
   OR level = '';

-- Drop existing constraint
ALTER TABLE hospitals 
DROP CONSTRAINT IF EXISTS hospitals_level_check;

-- Make column nullable
ALTER TABLE hospitals 
ALTER COLUMN level DROP NOT NULL;

-- Set default value for level column
ALTER TABLE hospitals 
ALTER COLUMN level SET DEFAULT 'غير محدد';

-- Create a new constraint that allows our default value
ALTER TABLE hospitals 
ADD CONSTRAINT hospitals_level_check 
CHECK (level IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد') OR level IS NULL);

-- Verify the constraint is working
SELECT 'Constraint created successfully' as status;
