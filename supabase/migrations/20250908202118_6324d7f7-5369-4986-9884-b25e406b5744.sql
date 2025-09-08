-- Create lost_and_found_items table
CREATE TABLE public.lost_and_found_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location_description TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  contact_method TEXT NOT NULL,
  contact_details TEXT NOT NULL,
  image_url TEXT,
  date_reported TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_lost_found DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lost_and_found_items ENABLE ROW LEVEL SECURITY;

-- Create policies for lost and found items
CREATE POLICY "Anyone can view active lost and found items" 
ON public.lost_and_found_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own lost and found reports" 
ON public.lost_and_found_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lost and found reports" 
ON public.lost_and_found_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost and found reports" 
ON public.lost_and_found_items 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all lost and found items" 
ON public.lost_and_found_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lost_and_found_items_updated_at
BEFORE UPDATE ON public.lost_and_found_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();