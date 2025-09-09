-- Remove the problematic view as it's flagged by security linter
DROP VIEW IF EXISTS public.lost_and_found_public;

-- The view is not needed since we're using RLS policies and a secure function
-- The existing RLS policy "Public can view limited lost and found info" 
-- already handles access control properly

-- Keep the secure function as it's properly implemented with SECURITY DEFINER
-- for controlled access to contact details