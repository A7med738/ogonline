-- Fix Security Definer View Issue
-- Replace the SECURITY DEFINER view with a regular view and use RLS policies instead

-- Drop the problematic SECURITY DEFINER view
DROP VIEW IF EXISTS public.safe_transport_requests;

-- Create a regular view without SECURITY DEFINER
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

-- Grant SELECT access to the view
GRANT SELECT ON public.safe_transport_requests TO public;

-- Create RLS policy for the view
ALTER VIEW public.safe_transport_requests SET (security_barrier = true);

-- The contact information will be accessed through the secure get_transport_contact function instead