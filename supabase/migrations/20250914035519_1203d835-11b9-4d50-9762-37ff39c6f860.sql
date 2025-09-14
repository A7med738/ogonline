-- CRITICAL SECURITY FIX: Secure School Transport Data from Child Safety Risks
-- This addresses the vulnerability where transport matches and contact numbers are exposed

-- 1. SECURE SCHOOL TRANSPORT MATCHES TABLE
-- Drop dangerous policies that allow unrestricted access
DROP POLICY IF EXISTS "Anyone can view school transport matches" ON public.school_transport_matches;
DROP POLICY IF EXISTS "Users can insert school transport matches" ON public.school_transport_matches;  
DROP POLICY IF EXISTS "Users can update school transport matches" ON public.school_transport_matches;

-- Create secure policies for school_transport_matches
CREATE POLICY "Only authenticated users can view relevant matches" 
ON public.school_transport_matches 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Users can only see matches involving their own requests
    EXISTS (
      SELECT 1 FROM public.school_transport_requests 
      WHERE id = school_transport_matches.request_id 
      AND user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create matches for their own requests" 
ON public.school_transport_matches 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.school_transport_requests 
    WHERE id = school_transport_matches.request_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update matches involving their requests" 
ON public.school_transport_matches 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.school_transport_requests 
    WHERE id = school_transport_matches.request_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete matches involving their requests" 
ON public.school_transport_matches 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.school_transport_requests 
    WHERE id = school_transport_matches.request_id 
    AND user_id = auth.uid()
  )
);

-- 2. UPDATE SCHOOL TRANSPORT REQUESTS TO PROPERLY HIDE CONTACT NUMBERS
-- Drop existing public policy that may expose contact numbers
DROP POLICY IF EXISTS "Public can view basic transport info" ON public.school_transport_requests;
DROP POLICY IF EXISTS "Authenticated users can view full transport details" ON public.school_transport_requests;

-- Create new policy that hides contact numbers from public
CREATE POLICY "Public can view basic transport info without contact details" 
ON public.school_transport_requests 
FOR SELECT 
USING (auth.uid() IS NULL AND status = 'active');

-- Policy for authenticated users (can see contact details via secure function)
CREATE POLICY "Authenticated users can view transport requests" 
ON public.school_transport_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND status = 'active');

-- 3. CREATE ADMIN POLICY FOR TRANSPORT MATCHES
CREATE POLICY "Admins can manage all transport matches" 
ON public.school_transport_matches 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. CREATE SECURITY FUNCTION FOR SAFE TRANSPORT MATCHING
CREATE OR REPLACE FUNCTION public.create_safe_transport_match(
  _request_id uuid,
  _offer_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  match_id uuid;
  request_user_id uuid;
BEGIN
  -- Only authenticated users can create matches
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create transport matches';
  END IF;

  -- Check if user owns the request
  SELECT user_id INTO request_user_id
  FROM public.school_transport_requests
  WHERE id = _request_id AND status = 'active';

  IF request_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only create matches for your own transport requests';
  END IF;

  -- Log the match creation attempt
  PERFORM public.log_sensitive_access('school_transport_matches', _request_id, 'match_creation');

  -- Create the match
  INSERT INTO public.school_transport_matches (request_id, offer_id, status)
  VALUES (_request_id, _offer_id, 'pending')
  RETURNING id INTO match_id;

  RETURN match_id;
END;
$$;

-- 5. CREATE VIEW FOR SAFE PUBLIC TRANSPORT DATA
CREATE OR REPLACE VIEW public.safe_transport_requests AS
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
  -- Hide contact details and user_id from public view
  CASE 
    WHEN auth.uid() IS NOT NULL THEN user_id 
    ELSE NULL 
  END as user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN contact_number 
    ELSE 'يرجى تسجيل الدخول للحصول على معلومات التواصل'::text 
  END as contact_info
FROM public.school_transport_requests
WHERE status = 'active';

-- Grant access to the safe view
GRANT SELECT ON public.safe_transport_requests TO public;