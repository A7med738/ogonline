-- Fix security issue: Restrict emergency contacts access to authenticated users only
-- Drop the existing public access policy
DROP POLICY IF EXISTS "Anyone can view emergency contacts" ON public.emergency_contacts;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can view emergency contacts" 
ON public.emergency_contacts 
FOR SELECT 
TO authenticated
USING (true);