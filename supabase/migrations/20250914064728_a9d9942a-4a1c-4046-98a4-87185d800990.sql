-- Fix Security Definer View issue
-- First, let's see what views exist with SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public' 
  AND definition ILIKE '%security definer%';

-- Also check for any functions with SECURITY DEFINER that might be causing issues
SELECT 
  routine_name,
  routine_definition,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND security_type = 'DEFINER';