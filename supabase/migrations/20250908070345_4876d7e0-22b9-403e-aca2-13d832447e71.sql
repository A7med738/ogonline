-- Create a function to get count of verified users
CREATE OR REPLACE FUNCTION public.get_verified_users_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT COUNT(*)::INTEGER
  FROM auth.users
  WHERE email_confirmed_at IS NOT NULL;
$$;