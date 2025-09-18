-- Remove level field from medical services tables
-- This migration removes the level field from hospitals table as it's not important

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
