-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent')),
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'land', 'commercial', 'office', 'villa')),
  price DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  location TEXT NOT NULL,
  area TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for properties (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Anyone can view approved properties') THEN
    CREATE POLICY "Anyone can view approved properties" ON properties
      FOR SELECT USING (status = 'approved');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Users can view their own properties') THEN
    CREATE POLICY "Users can view their own properties" ON properties
      FOR SELECT USING (auth.uid() = owner_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Users can insert their own properties') THEN
    CREATE POLICY "Users can insert their own properties" ON properties
      FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Users can update their own pending properties') THEN
    CREATE POLICY "Users can update their own pending properties" ON properties
      FOR UPDATE USING (auth.uid() = owner_id AND status = 'pending');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Admins can view all properties') THEN
    CREATE POLICY "Admins can view all properties" ON properties
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE user_id = auth.uid() AND job_title = 'admin'
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Admins can update any property') THEN
    CREATE POLICY "Admins can update any property" ON properties
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE user_id = auth.uid() AND job_title = 'admin'
        )
      );
  END IF;
END $$;

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_properties_updated_at') THEN
    CREATE TRIGGER update_properties_updated_at
      BEFORE UPDATE ON public.properties
      FOR EACH ROW
      EXECUTE FUNCTION update_properties_updated_at();
  END IF;
END $$;
