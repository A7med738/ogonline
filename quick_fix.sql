-- Quick fix for trip system errors
-- Run this in Supabase SQL Editor

-- 1. Drop all existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on trips table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'trips') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.trips';
    END LOOP;
    
    -- Drop all policies on trip_stations table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'trip_stations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.trip_stations';
    END LOOP;
    
    -- Drop all policies on trip_passengers table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'trip_passengers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.trip_passengers';
    END LOOP;
END $$;

-- 2. Create simple, working policies
CREATE POLICY "view_active_trips" ON public.trips FOR SELECT USING (status = 'active');
CREATE POLICY "view_own_trips" ON public.trips FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "create_trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "update_own_trips" ON public.trips FOR UPDATE USING (auth.uid() = driver_id);
CREATE POLICY "delete_own_trips" ON public.trips FOR DELETE USING (auth.uid() = driver_id);

CREATE POLICY "view_stations" ON public.trip_stations FOR SELECT USING (true);
CREATE POLICY "manage_stations" ON public.trip_stations FOR ALL USING (auth.uid() = (SELECT driver_id FROM public.trips WHERE id = trip_stations.trip_id));

CREATE POLICY "view_passengers" ON public.trip_passengers FOR SELECT USING (true);
CREATE POLICY "register_passengers" ON public.trip_passengers FOR INSERT WITH CHECK (auth.uid() = passenger_id OR passenger_id IS NULL);
CREATE POLICY "update_own_registrations" ON public.trip_passengers FOR UPDATE USING (auth.uid() = passenger_id);

-- 3. Create craftsmen table if missing
CREATE TABLE IF NOT EXISTS public.craftsmen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

ALTER TABLE public.craftsmen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_active_craftsmen" ON public.craftsmen FOR SELECT USING (is_active = true);

-- 4. Add sample data
INSERT INTO public.trips (driver_id, title, from_location, to_location, departure_time, price, max_passengers, trip_type, vehicle_type, contact_number) 
VALUES ('00000000-0000-0000-0000-000000000000', 'رحلة تجريبية', 'حدائق أكتوبر', 'وسط البلد', NOW() + INTERVAL '1 hour', 25.00, 4, 'regular', 'car', '01234567890')
ON CONFLICT DO NOTHING;

INSERT INTO public.craftsmen (name, profession, phone, rating) 
VALUES ('أحمد محمد', 'كهربائي', '01234567890', 4.5)
ON CONFLICT DO NOTHING;
