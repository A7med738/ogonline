-- Create police stations table
CREATE TABLE public.police_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.police_stations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view police stations" 
ON public.police_stations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage police stations" 
ON public.police_stations 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add station_id to emergency_contacts table
ALTER TABLE public.emergency_contacts 
ADD COLUMN station_id UUID REFERENCES public.police_stations(id) ON DELETE SET NULL;

-- Create trigger for timestamps on police_stations
CREATE TRIGGER update_police_stations_updated_at
BEFORE UPDATE ON public.police_stations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();