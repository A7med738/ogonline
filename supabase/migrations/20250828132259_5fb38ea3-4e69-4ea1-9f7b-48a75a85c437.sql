-- Create email subscriptions table
CREATE TABLE public.email_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for email subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.email_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscription" 
ON public.email_subscriptions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" 
ON public.email_subscriptions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for timestamps
CREATE TRIGGER update_email_subscriptions_updated_at
BEFORE UPDATE ON public.email_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically subscribe users when they sign up
CREATE OR REPLACE FUNCTION public.auto_subscribe_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_subscriptions (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-subscribe new users
CREATE TRIGGER on_auth_user_created_subscribe
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_subscribe_user();