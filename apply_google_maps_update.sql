-- Add Google Maps URL field to malls table
ALTER TABLE malls ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Update existing mall with sample Google Maps URL
UPDATE malls 
SET google_maps_url = 'https://maps.google.com/maps?q=حدائق+أكتوبر+الجيزة+مصر'
WHERE name = 'مول حدائق أكتوبر' AND google_maps_url IS NULL;
