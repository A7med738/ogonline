-- Fix level constraint in hospitals table
-- Run this in Supabase SQL Editor

-- First, let's see what the current constraint allows
-- Then drop the existing constraint
ALTER TABLE hospitals 
DROP CONSTRAINT IF EXISTS hospitals_level_check;

-- Create a new constraint that allows our default value
ALTER TABLE hospitals 
ADD CONSTRAINT hospitals_level_check 
CHECK (level IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد') OR level IS NULL);

-- Update any existing invalid values
UPDATE hospitals 
SET level = 'غير محدد' 
WHERE level NOT IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد') OR level IS NULL;
