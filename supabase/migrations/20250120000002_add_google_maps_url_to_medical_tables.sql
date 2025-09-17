-- Add google_maps_url column to all medical services tables

-- Add to hospitals table
ALTER TABLE hospitals 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add to clinics table  
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add to health_units table
ALTER TABLE health_units
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add to medical_centers table
ALTER TABLE medical_centers
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
