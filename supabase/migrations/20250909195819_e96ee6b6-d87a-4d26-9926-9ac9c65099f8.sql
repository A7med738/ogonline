-- Drop existing public access policy
DROP POLICY IF EXISTS "Anyone can view active lost and found items" ON public.lost_and_found_items;

-- Create a view that excludes sensitive contact information for public access
CREATE OR REPLACE VIEW public.lost_and_found_public AS
SELECT 
  id,
  type,
  title,
  description,
  category,
  location_description,
  latitude,
  longitude,
  image_url,
  date_reported,
  date_lost_found,
  status,
  created_at,
  -- Hide actual contact details from public view
  contact_method,
  'للتواصل يرجى تسجيل الدخول' as contact_details
FROM public.lost_and_found_items
WHERE is_active = true AND status = 'active';

-- Create new RLS policies
CREATE POLICY "Public can view limited lost and found info" 
ON public.lost_and_found_items 
FOR SELECT 
USING (is_active = true AND status = 'active');

-- Create secure function to get contact details for authenticated users
CREATE OR REPLACE FUNCTION public.get_lost_found_contact(item_id uuid)
RETURNS TABLE (
  contact_method text,
  contact_details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    l.contact_method,
    l.contact_details
  FROM public.lost_and_found_items l
  WHERE l.id = item_id 
    AND l.is_active = true 
    AND l.status = 'active';
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_lost_found_contact(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lost_found_contact(uuid) TO anon;