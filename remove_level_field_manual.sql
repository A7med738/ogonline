-- Remove level field from hospitals table
-- Run this in Supabase SQL Editor

-- Drop the constraint first
ALTER TABLE public.hospitals 
DROP CONSTRAINT IF EXISTS hospitals_level_check;

-- Drop the index
DROP INDEX IF EXISTS idx_hospitals_level;

-- Remove the level column
ALTER TABLE public.hospitals 
DROP COLUMN IF EXISTS level;

-- Verify the column is removed
SELECT 'Level column removed successfully from hospitals table' as status;
