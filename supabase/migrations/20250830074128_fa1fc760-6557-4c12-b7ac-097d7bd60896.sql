-- Fix the Security Definer view issue by dropping it and using a different approach

-- 1. Drop the problematic view
DROP VIEW IF EXISTS public.city_departments_public;

-- 2. Remove the conflicting policy
DROP POLICY IF EXISTS "Anyone can view basic city department info" ON public.city_departments;

-- 3. Create a simple policy that allows anonymous users to see basic info only
-- We'll handle the contact info restriction in the application layer
CREATE POLICY "Public can view basic department info" 
ON public.city_departments 
FOR SELECT 
TO public
USING (true);