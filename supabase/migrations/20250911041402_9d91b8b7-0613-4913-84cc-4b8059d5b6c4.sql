-- Ensure school_transport_requests table exists with correct structure
CREATE TABLE IF NOT EXISTS public.school_transport_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  number_of_children INTEGER NOT NULL,
  price NUMERIC NULL,
  description TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE public.school_transport_requests ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    -- Check if policies exist before creating them
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_transport_requests' 
        AND policyname = 'Anyone can view school transport requests'
    ) THEN
        CREATE POLICY "Anyone can view school transport requests" 
        ON public.school_transport_requests 
        FOR SELECT 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_transport_requests' 
        AND policyname = 'Users can insert their own school transport requests'
    ) THEN
        CREATE POLICY "Users can insert their own school transport requests" 
        ON public.school_transport_requests 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_transport_requests' 
        AND policyname = 'Users can update their own school transport requests'
    ) THEN
        CREATE POLICY "Users can update their own school transport requests" 
        ON public.school_transport_requests 
        FOR UPDATE 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'school_transport_requests' 
        AND policyname = 'Users can delete their own school transport requests'
    ) THEN
        CREATE POLICY "Users can delete their own school transport requests" 
        ON public.school_transport_requests 
        FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_school_transport_requests_updated_at'
    ) THEN
        CREATE TRIGGER update_school_transport_requests_updated_at
        BEFORE UPDATE ON public.school_transport_requests
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;