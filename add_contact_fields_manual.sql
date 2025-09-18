-- Add additional contact fields to pharmacies and medical centers
-- This migration adds phone2, whatsapp, and facebook_url fields

-- Add new fields to pharmacies table
ALTER TABLE public.pharmacies 
ADD COLUMN IF NOT EXISTS phone2 TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Add new fields to medical_centers table
ALTER TABLE public.medical_centers 
ADD COLUMN IF NOT EXISTS phone2 TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Add new fields to clinics table
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS phone2 TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Add new fields to health_units table
ALTER TABLE public.health_units 
ADD COLUMN IF NOT EXISTS phone2 TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Add new fields to hospitals table
ALTER TABLE public.hospitals 
ADD COLUMN IF NOT EXISTS phone2 TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.pharmacies.phone2 IS 'رقم تليفون إضافي';
COMMENT ON COLUMN public.pharmacies.whatsapp IS 'رقم واتساب';
COMMENT ON COLUMN public.pharmacies.facebook_url IS 'رابط صفحة الفيسبوك';

COMMENT ON COLUMN public.medical_centers.phone2 IS 'رقم تليفون إضافي';
COMMENT ON COLUMN public.medical_centers.whatsapp IS 'رقم واتساب';
COMMENT ON COLUMN public.medical_centers.facebook_url IS 'رابط صفحة الفيسبوك';

COMMENT ON COLUMN public.clinics.phone2 IS 'رقم تليفون إضافي';
COMMENT ON COLUMN public.clinics.whatsapp IS 'رقم واتساب';
COMMENT ON COLUMN public.clinics.facebook_url IS 'رابط صفحة الفيسبوك';

COMMENT ON COLUMN public.health_units.phone2 IS 'رقم تليفون إضافي';
COMMENT ON COLUMN public.health_units.whatsapp IS 'رقم واتساب';
COMMENT ON COLUMN public.health_units.facebook_url IS 'رابط صفحة الفيسبوك';

COMMENT ON COLUMN public.hospitals.phone2 IS 'رقم تليفون إضافي';
COMMENT ON COLUMN public.hospitals.whatsapp IS 'رقم واتساب';
COMMENT ON COLUMN public.hospitals.facebook_url IS 'رابط صفحة الفيسبوك';
