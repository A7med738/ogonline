-- Fix the security issue with search path
CREATE OR REPLACE FUNCTION public.auto_subscribe_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.email_subscriptions (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;