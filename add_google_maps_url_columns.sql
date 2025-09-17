-- Add google_maps_url column to all service tables
-- Run this in Supabase SQL Editor

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
