-- Update worship places schema to include new fields
-- This migration adds new fields for worship places

-- Add new columns to worship_places table
ALTER TABLE worship_places 
ADD COLUMN IF NOT EXISTS images TEXT[], -- Array of image URLs
ADD COLUMN IF NOT EXISTS imam_name TEXT, -- Imam name
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8), -- Latitude coordinate
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8), -- Longitude coordinate
ADD COLUMN IF NOT EXISTS google_maps_url TEXT; -- Google Maps URL

-- Remove prayer_times column if it exists (since we're removing prayer times)
-- ALTER TABLE worship_places DROP COLUMN IF EXISTS prayer_times;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_worship_places_location ON worship_places(latitude, longitude);

-- Create index for imam name searches
CREATE INDEX IF NOT EXISTS idx_worship_places_imam_name ON worship_places(imam_name);

-- Update sample data with new fields
UPDATE worship_places 
SET 
  images = ARRAY['https://example.com/mosque1.jpg', 'https://example.com/mosque2.jpg'],
  imam_name = 'الشيخ أحمد محمد',
  latitude = 29.9682,
  longitude = 30.9273,
  google_maps_url = 'https://maps.google.com/?q=29.9682,30.9273'
WHERE name = 'مسجد النور';

-- Add more sample data
INSERT INTO worship_places (
  name, 
  type, 
  address, 
  phone, 
  description, 
  image_url, 
  logo_url, 
  images,
  imam_name,
  latitude,
  longitude,
  google_maps_url,
  capacity, 
  is_accessible
) VALUES 
(
  'مسجد الفتح',
  'مسجد',
  'شارع الفتح، حدائق أكتوبر',
  '01001234568',
  'مسجد حديث يخدم المجتمع المحلي',
  '/placeholder.svg',
  '/placeholder.svg',
  ARRAY['https://example.com/mosque3.jpg', 'https://example.com/mosque4.jpg', 'https://example.com/mosque5.jpg'],
  'الشيخ محمد أحمد',
  29.9700,
  30.9300,
  'https://maps.google.com/?q=29.9700,30.9300',
  500,
  true
),
(
  'كنيسة القديسة مريم',
  'كنيسة',
  'شارع الكنائس، حدائق أكتوبر',
  '01001234569',
  'كنيسة كاثوليكية تخدم المجتمع المسيحي',
  '/placeholder.svg',
  '/placeholder.svg',
  ARRAY['https://example.com/church1.jpg', 'https://example.com/church2.jpg'],
  'الأب جورج',
  29.9750,
  30.9350,
  'https://maps.google.com/?q=29.9750,30.9350',
  300,
  true
);
