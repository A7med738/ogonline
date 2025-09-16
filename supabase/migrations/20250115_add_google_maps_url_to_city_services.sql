-- Add google_maps_url column to all city services tables
-- This migration adds Google Maps URL support to all city services

-- Add google_maps_url to ATMs table
ALTER TABLE public.atms 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add google_maps_url to banks table
ALTER TABLE public.banks 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add google_maps_url to youth_clubs table
ALTER TABLE public.youth_clubs 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add google_maps_url to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add google_maps_url to post_offices table
ALTER TABLE public.post_offices 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Add comments to describe the new column
COMMENT ON COLUMN public.atms.google_maps_url IS 'Google Maps URL for the ATM location';
COMMENT ON COLUMN public.banks.google_maps_url IS 'Google Maps URL for the bank location';
COMMENT ON COLUMN public.youth_clubs.google_maps_url IS 'Google Maps URL for the youth club location';
COMMENT ON COLUMN public.events.google_maps_url IS 'Google Maps URL for the event venue';
COMMENT ON COLUMN public.post_offices.google_maps_url IS 'Google Maps URL for the post office location';
