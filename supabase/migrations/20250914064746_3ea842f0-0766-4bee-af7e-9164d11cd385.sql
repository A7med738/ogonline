-- Let's check if there's a SECURITY DEFINER view we missed
-- Look specifically at pg_views with better filtering
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views 
WHERE schemaname = 'public';

-- Also check for any view that might have SECURITY DEFINER in its definition
-- This will help us find the problematic view