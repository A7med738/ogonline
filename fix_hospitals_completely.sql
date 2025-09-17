-- Complete fix for hospitals level constraint
-- Run this in Supabase SQL Editor

-- Step 1: Check what values exist
SELECT 'Current values in level column:' as step;
SELECT DISTINCT level, COUNT(*) as count 
FROM hospitals 
GROUP BY level 
ORDER BY level;

-- Step 2: Update all invalid values to 'غير محدد'
UPDATE hospitals 
SET level = 'غير محدد' 
WHERE level IS NULL 
   OR level = ''
   OR level NOT IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد');

-- Step 3: Drop the existing constraint
ALTER TABLE hospitals 
DROP CONSTRAINT IF EXISTS hospitals_level_check;

-- Step 4: Make the column nullable and set default
ALTER TABLE hospitals 
ALTER COLUMN level DROP NOT NULL;

ALTER TABLE hospitals 
ALTER COLUMN level SET DEFAULT 'غير محدد';

-- Step 5: Create new constraint
ALTER TABLE hospitals 
ADD CONSTRAINT hospitals_level_check 
CHECK (level IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد') OR level IS NULL);

-- Step 6: Verify the fix
SELECT 'After fix - values in level column:' as step;
SELECT DISTINCT level, COUNT(*) as count 
FROM hospitals 
GROUP BY level 
ORDER BY level;

-- Step 7: Test insert
SELECT 'Constraint test passed!' as result;
