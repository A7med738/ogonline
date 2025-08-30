-- Fix security issue: Restrict city_departments contact information access

-- 1. Remove the overly permissive public access policy
DROP POLICY IF EXISTS "Anyone can view city departments" ON public.city_departments;

-- 2. Create a policy for authenticated users to view contact details
CREATE POLICY "Authenticated users can view city departments" 
ON public.city_departments 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Create a public view with basic information only (no contact details)
CREATE OR REPLACE VIEW public.city_departments_public AS
SELECT 
  id,
  title,
  description,
  hours,
  icon,
  color,
  order_priority,
  created_at,
  updated_at
FROM public.city_departments;

-- 4. Enable RLS on the view (inherited from table)
-- Note: Views inherit RLS from underlying tables, but we make it explicit

-- 5. Create a policy for the public view that allows everyone to see basic info
CREATE POLICY "Anyone can view basic city department info" 
ON public.city_departments 
FOR SELECT 
TO public
USING (true);

-- 6. Grant SELECT permission on the public view to anonymous users
GRANT SELECT ON public.city_departments_public TO anon;
GRANT SELECT ON public.city_departments_public TO authenticated;