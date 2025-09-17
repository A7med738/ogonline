-- Make level column optional in hospitals table
-- Run this in Supabase SQL Editor

-- Make level column nullable in hospitals table
ALTER TABLE hospitals 
ALTER COLUMN level DROP NOT NULL;

-- Set default value for level column
ALTER TABLE hospitals 
ALTER COLUMN level SET DEFAULT 'غير محدد';

-- Update existing null values to have a default value
UPDATE hospitals 
SET level = 'غير محدد' 
WHERE level IS NULL;
