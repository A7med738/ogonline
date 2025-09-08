-- Update RLS policies for admins to view all jobs regardless of ownership
-- This ensures admin can see all jobs in the management interface

-- First, let's create a more permissive policy for admins
CREATE POLICY "Admins can view all jobs regardless of status" 
ON public.jobs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update the existing admin policy to be more specific
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;