-- Create school transport requests table
CREATE TABLE public.school_transport_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('request', 'offer')),
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  number_of_children INTEGER NOT NULL,
  contact_number TEXT NOT NULL,
  price DECIMAL(10,2),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create school transport matches table
CREATE TABLE public.school_transport_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.school_transport_requests(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.school_transport_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, offer_id)
);

-- Enable RLS
ALTER TABLE public.school_transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_transport_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for school_transport_requests
CREATE POLICY "Anyone can view school transport requests" 
ON public.school_transport_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own school transport requests" 
ON public.school_transport_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own school transport requests" 
ON public.school_transport_requests 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own school transport requests" 
ON public.school_transport_requests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for school_transport_matches
CREATE POLICY "Anyone can view school transport matches" 
ON public.school_transport_matches 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert school transport matches" 
ON public.school_transport_matches 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update school transport matches" 
ON public.school_transport_matches 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_school_transport_requests_updated_at
BEFORE UPDATE ON public.school_transport_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_transport_matches_updated_at
BEFORE UPDATE ON public.school_transport_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
