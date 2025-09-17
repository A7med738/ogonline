-- Fix existing data in hospitals table before applying constraint
-- Run this in Supabase SQL Editor

-- First, let's see what values exist in the level column
SELECT DISTINCT level, COUNT(*) as count 
FROM hospitals 
GROUP BY level 
ORDER BY level;

-- Update any invalid values to our default
UPDATE hospitals 
SET level = 'غير محدد' 
WHERE level IS NULL 
   OR level NOT IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد')
   OR level = '';

-- Now apply the constraint
ALTER TABLE hospitals 
DROP CONSTRAINT IF EXISTS hospitals_level_check;

ALTER TABLE hospitals 
ADD CONSTRAINT hospitals_level_check 
CHECK (level IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد') OR level IS NULL);

-- Verify the fix
SELECT DISTINCT level, COUNT(*) as count 
FROM hospitals 
GROUP BY level 
ORDER BY level;
