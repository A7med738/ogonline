-- Fix existing hospitals data only
-- Run this in Supabase SQL Editor

-- Update any invalid values to our default
UPDATE hospitals 
SET level = 'غير محدد' 
WHERE level IS NULL 
   OR level NOT IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد')
   OR level = '';

-- Verify the fix
SELECT DISTINCT level, COUNT(*) as count 
FROM hospitals 
GROUP BY level 
ORDER BY level;
