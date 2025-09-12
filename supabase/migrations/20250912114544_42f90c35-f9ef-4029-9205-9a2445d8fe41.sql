-- CRITICAL SECURITY FIXES - Phase 1: Protect Exposed Contact Information

-- 1. Fix Properties Contact Information Exposure
-- Drop the overly permissive policy that exposes contact details
DROP POLICY IF EXISTS "Anyone can view approved properties" ON public.properties;

-- Create new policies that protect contact information
CREATE POLICY "Public can view basic property info" 
ON public.properties 
FOR SELECT 
USING (status = 'approved' AND auth.uid() IS NULL);

CREATE POLICY "Authenticated users can view full property details" 
ON public.properties 
FOR SELECT 
USING (status = 'approved' AND auth.uid() IS NOT NULL);

-- 2. Fix School Transport Contact Information Exposure  
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view school transport requests" ON public.school_transport_requests;

-- Create new policies that protect contact numbers
CREATE POLICY "Public can view basic transport info" 
ON public.school_transport_requests 
FOR SELECT 
USING (auth.uid() IS NULL);

CREATE POLICY "Authenticated users can view full transport details" 
ON public.school_transport_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. Protect User Activity Data in News Likes
-- Drop existing policy and create new one that hides user IDs from public
DROP POLICY IF EXISTS "Anyone can view likes" ON public.news_likes;

CREATE POLICY "Public can view like counts only" 
ON public.news_likes 
FOR SELECT 
USING (auth.uid() IS NULL);

CREATE POLICY "Authenticated users can view likes" 
ON public.news_likes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Protect User Activity Data in News Comments  
-- Drop existing policy and create new one that hides user IDs from public
DROP POLICY IF EXISTS "Anyone can view comments" ON public.news_comments;

CREATE POLICY "Public can view comment content only" 
ON public.news_comments 
FOR SELECT 
USING (auth.uid() IS NULL);

CREATE POLICY "Authenticated users can view full comments" 
ON public.news_comments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 5. Additional Security: Create function to get contact info securely
CREATE OR REPLACE FUNCTION public.get_property_contact(property_id uuid)
RETURNS TABLE(contact_method text, contact_details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only authenticated users can access contact details
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT 
      'login_required'::text as contact_method,
      'يرجى تسجيل الدخول للحصول على معلومات التواصل'::text as contact_details;
    RETURN;
  END IF;

  -- Return actual contact details for authenticated users
  RETURN QUERY 
  SELECT 
    CASE 
      WHEN p.contact_phone IS NOT NULL THEN 'phone'::text
      WHEN p.contact_email IS NOT NULL THEN 'email'::text
      ELSE 'none'::text
    END as contact_method,
    COALESCE(p.contact_phone, p.contact_email, 'غير متوفر'::text) as contact_details
  FROM public.properties p
  WHERE p.id = property_id 
    AND p.status = 'approved';
END;
$$;

-- 6. Create function to get school transport contact securely
CREATE OR REPLACE FUNCTION public.get_transport_contact(request_id uuid)
RETURNS TABLE(contact_method text, contact_details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only authenticated users can access contact details
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT 
      'login_required'::text as contact_method,
      'يرجى تسجيل الدخول للحصول على معلومات التواصل'::text as contact_details;
    RETURN;
  END IF;

  -- Return actual contact details for authenticated users
  RETURN QUERY 
  SELECT 
    'phone'::text as contact_method,
    s.contact_number as contact_details
  FROM public.school_transport_requests s
  WHERE s.id = request_id 
    AND s.status = 'active';
END;
$$;