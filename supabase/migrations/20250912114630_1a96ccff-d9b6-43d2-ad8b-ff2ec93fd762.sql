-- SECURITY FIXES - Phase 2: Function Security and Additional Hardening

-- Fix function search paths (addressing linter warnings)
ALTER FUNCTION public.get_verified_users_count() SET search_path = 'public', 'auth';
ALTER FUNCTION public.match_embeddings(vector, double precision, integer) SET search_path = 'public';
ALTER FUNCTION public.increment_property_views(uuid) SET search_path = 'public';
ALTER FUNCTION public.increment_property_likes(uuid) SET search_path = 'public';

-- Create secure audit logging function
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  accessed_table text,
  accessed_id uuid,
  access_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only log if user is authenticated
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO admin_actions (
      admin_id,
      action_type,
      target_type,
      target_id,
      description,
      metadata
    ) VALUES (
      auth.uid(),
      'data_access',
      accessed_table,
      accessed_id,
      'Sensitive data accessed: ' || access_type,
      jsonb_build_object(
        'access_time', now(),
        'access_type', access_type,
        'table', accessed_table
      )
    );
  END IF;
END;
$$;

-- Update property contact function to include logging
CREATE OR REPLACE FUNCTION public.get_property_contact(property_id uuid)
RETURNS TABLE(contact_method text, contact_details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only authenticated users can access contact details
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT 
      'login_required'::text as contact_method,
      'يرجى تسجيل الدخول للحصول على معلومات التواصل'::text as contact_details;
    RETURN;
  END IF;

  -- Log the access attempt
  PERFORM public.log_sensitive_access('properties', property_id, 'contact_info');

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

-- Update transport contact function to include logging
CREATE OR REPLACE FUNCTION public.get_transport_contact(request_id uuid)
RETURNS TABLE(contact_method text, contact_details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only authenticated users can access contact details
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT 
      'login_required'::text as contact_method,
      'يرجى تسجيل الدخول للحصول على معلومات التواصل'::text as contact_details;
    RETURN;
  END IF;

  -- Log the access attempt
  PERFORM public.log_sensitive_access('school_transport_requests', request_id, 'contact_info');

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

-- Create rate limiting function for sensitive operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation text,
  limit_count integer DEFAULT 10,
  time_window interval DEFAULT '1 hour'::interval
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_count integer;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Count recent operations
  SELECT COUNT(*)
  INTO current_count
  FROM admin_actions
  WHERE admin_id = auth.uid()
    AND action_type = operation
    AND created_at > (now() - time_window);

  -- Return true if under limit
  RETURN current_count < limit_count;
END;
$$;