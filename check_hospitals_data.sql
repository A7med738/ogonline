-- Check what values exist in hospitals level column
-- Run this in Supabase SQL Editor

SELECT DISTINCT level, COUNT(*) as count 
FROM hospitals 
GROUP BY level 
ORDER BY level;

-- Also check for any special characters or spaces
SELECT level, LENGTH(level) as length, COUNT(*) as count
FROM hospitals 
GROUP BY level, LENGTH(level)
ORDER BY level;
