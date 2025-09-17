-- Add google_maps_url column to all educational services tables

-- Add to schools table
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add to nurseries table  
ALTER TABLE nurseries
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add to educational_centers table
ALTER TABLE educational_centers
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add to teachers table
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add to universities table
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
