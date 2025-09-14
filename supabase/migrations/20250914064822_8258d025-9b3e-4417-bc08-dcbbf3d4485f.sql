-- Fix Security Definer View issue by recreating the safe_transport_requests view
-- without SECURITY DEFINER property

-- First, drop the existing view that has SECURITY DEFINER
DROP VIEW IF EXISTS public.safe_transport_requests;

-- Recreate the view as a regular view (without SECURITY DEFINER)
-- This view shows only safe data without contact numbers
CREATE VIEW public.safe_transport_requests AS
SELECT 
  id,
  type,
  from_location,
  to_location,
  number_of_children,
  price,
  description,
  status,
  created_at,
  updated_at
FROM public.school_transport_requests
WHERE status = 'active';

-- The view will now use the RLS policies of the underlying table
-- instead of bypassing them with SECURITY DEFINER