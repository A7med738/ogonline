-- Fix trip system errors - Version 2
-- Apply this SQL directly in Supabase SQL Editor

-- 1. Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view trips they are passengers in" ON public.trips;
DROP POLICY IF EXISTS "Users can create trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON public.trips;

DROP POLICY IF EXISTS "Anyone can view trip stations" ON public.trip_stations;
DROP POLICY IF EXISTS "Trip drivers can manage stations" ON public.trip_stations;

DROP POLICY IF EXISTS "Anyone can view trip passengers" ON public.trip_passengers;
DROP POLICY IF EXISTS "Users can view trip passengers" ON public.trips;
DROP POLICY IF EXISTS "Users can register for trips" ON public.trip_passengers;
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.trip_passengers;
DROP POLICY IF EXISTS "Trip drivers can manage passengers" ON public.trip_passengers;

-- 2. Create clean, simple policies
CREATE POLICY "Anyone can view active trips" 
ON public.trips 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can view their own trips" 
ON public.trips 
FOR SELECT 
USING (auth.uid() = driver_id);

CREATE POLICY "Users can create trips" 
ON public.trips 
FOR INSERT 
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Users can update their own trips" 
ON public.trips 
FOR UPDATE 
USING (auth.uid() = driver_id)
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Users can delete their own trips" 
ON public.trips 
FOR DELETE 
USING (auth.uid() = driver_id);

-- 3. Trip stations policies
CREATE POLICY "Anyone can view trip stations" 
ON public.trip_stations 
FOR SELECT 
USING (true);

CREATE POLICY "Trip drivers can manage stations" 
ON public.trip_stations 
FOR ALL 
USING (auth.uid() = (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_stations.trip_id
))
WITH CHECK (auth.uid() = (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_stations.trip_id
));

-- 4. Trip passengers policies
CREATE POLICY "Anyone can view trip passengers" 
ON public.trip_passengers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can register for trips" 
ON public.trip_passengers 
FOR INSERT 
WITH CHECK (auth.uid() = passenger_id OR passenger_id IS NULL);

CREATE POLICY "Users can update their own registrations" 
ON public.trip_passengers 
FOR UPDATE 
USING (auth.uid() = passenger_id)
WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Trip drivers can manage passengers" 
ON public.trip_passengers 
FOR ALL 
USING (auth.uid() = (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_passengers.trip_id
))
WITH CHECK (auth.uid() = (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_passengers.trip_id
));

-- 5. Create craftsmen table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.craftsmen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  profession TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  services TEXT[],
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for craftsmen if not already enabled
ALTER TABLE public.craftsmen ENABLE ROW LEVEL SECURITY;

-- Drop existing craftsmen policies if they exist
DROP POLICY IF EXISTS "Anyone can view active craftsmen" ON public.craftsmen;
DROP POLICY IF EXISTS "Anyone can view craftsmen" ON public.craftsmen;

-- Create craftsmen policies
CREATE POLICY "Anyone can view active craftsmen" 
ON public.craftsmen 
FOR SELECT 
USING (is_active = true);

-- 6. Insert sample data for testing (only if not exists)
INSERT INTO public.trips (driver_id, title, description, from_location, to_location, departure_time, arrival_time, price, max_passengers, trip_type, vehicle_type, contact_number) 
SELECT '00000000-0000-0000-0000-000000000000', 'رحلة تجريبية', 'رحلة تجريبية لاختبار النظام', 'حدائق أكتوبر', 'وسط البلد', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 25.00, 4, 'regular', 'car', '01234567890'
WHERE NOT EXISTS (SELECT 1 FROM public.trips WHERE title = 'رحلة تجريبية');

-- 7. Insert sample craftsmen data
INSERT INTO public.craftsmen (name, profession, address, phone, description, services, rating) 
SELECT 'أحمد محمد', 'كهربائي', 'حدائق أكتوبر', '01234567890', 'كهربائي محترف', ARRAY['إصلاح كهرباء', 'تركيب أجهزة'], 4.5
WHERE NOT EXISTS (SELECT 1 FROM public.craftsmen WHERE name = 'أحمد محمد');

-- 8. Verify tables exist and have data
SELECT 'trips' as table_name, COUNT(*) as count FROM public.trips
UNION ALL
SELECT 'trip_stations' as table_name, COUNT(*) as count FROM public.trip_stations
UNION ALL
SELECT 'trip_passengers' as table_name, COUNT(*) as count FROM public.trip_passengers
UNION ALL
SELECT 'craftsmen' as table_name, COUNT(*) as count FROM public.craftsmen;
