-- Remove constraint completely and make level optional
-- Run this in Supabase SQL Editor

-- Step 1: Update all values to 'غير محدد'
UPDATE hospitals 
SET level = 'غير محدد' 
WHERE level IS NULL OR level = '';

-- Step 2: Drop the constraint completely
ALTER TABLE hospitals 
DROP CONSTRAINT IF EXISTS hospitals_level_check;

-- Step 3: Make column nullable with default
ALTER TABLE hospitals 
ALTER COLUMN level DROP NOT NULL;

ALTER TABLE hospitals 
ALTER COLUMN level SET DEFAULT 'غير محدد';

-- Step 4: Verify
SELECT DISTINCT level, COUNT(*) as count 
FROM hospitals 
GROUP BY level 
ORDER BY level;

SELECT 'Constraint removed successfully!' as result;
