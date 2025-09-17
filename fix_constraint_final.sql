-- Fix the constraint to allow "غير محدد"
-- Run this in Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE hospitals 
DROP CONSTRAINT IF EXISTS hospitals_level_check;

-- Create a new constraint that allows "غير محدد"
ALTER TABLE hospitals 
ADD CONSTRAINT hospitals_level_check 
CHECK (level IN ('أولي', 'ثانوي', 'ثالثي', 'رابعي', 'غير محدد') OR level IS NULL);

-- Verify the constraint is working
SELECT DISTINCT level, COUNT(*) as count 
FROM hospitals 
GROUP BY level 
ORDER BY level;
