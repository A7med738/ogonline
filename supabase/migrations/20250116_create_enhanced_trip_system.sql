-- Create enhanced trip system for "توصيلة" service
-- This migration creates tables for managing trips with multiple stations and passenger lists

-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE,
  arrival_time TIMESTAMP WITH TIME ZONE,
  price DECIMAL(10,2),
  max_passengers INTEGER DEFAULT 4,
  current_passengers INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'full')),
  trip_type TEXT NOT NULL DEFAULT 'regular' CHECK (trip_type IN ('regular', 'school', 'work', 'event')),
  vehicle_type TEXT DEFAULT 'car' CHECK (vehicle_type IN ('car', 'van', 'bus', 'motorcycle')),
  contact_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create trip stations table
CREATE TABLE IF NOT EXISTS public.trip_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  station_name TEXT NOT NULL,
  station_order INTEGER NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  pickup_time TIME,
  dropoff_time TIME,
  is_pickup_only BOOLEAN DEFAULT false,
  is_dropoff_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create trip passengers table
CREATE TABLE IF NOT EXISTS public.trip_passengers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  passenger_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  pickup_station_id UUID REFERENCES public.trip_stations(id),
  dropoff_station_id UUID REFERENCES public.trip_stations(id),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- Create trip reviews table
CREATE TABLE IF NOT EXISTS public.trip_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('driver', 'passenger')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for trips table
CREATE POLICY "Anyone can view active trips" 
ON public.trips 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can view their own trips" 
ON public.trips 
FOR SELECT 
USING (auth.uid() = driver_id OR auth.uid() IN (
  SELECT passenger_id FROM public.trip_passengers 
  WHERE trip_id = trips.id AND passenger_id = auth.uid()
));

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

-- Create policies for trip_stations table
CREATE POLICY "Anyone can view trip stations" 
ON public.trip_stations 
FOR SELECT 
USING (true);

CREATE POLICY "Trip drivers can manage stations" 
ON public.trip_stations 
FOR ALL 
USING (auth.uid() IN (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_stations.trip_id
))
WITH CHECK (auth.uid() IN (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_stations.trip_id
));

-- Create policies for trip_passengers table
CREATE POLICY "Users can view trip passengers" 
ON public.trip_passengers 
FOR SELECT 
USING (auth.uid() IN (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_passengers.trip_id
) OR auth.uid() = passenger_id);

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
USING (auth.uid() IN (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_passengers.trip_id
))
WITH CHECK (auth.uid() IN (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_passengers.trip_id
));

-- Create policies for trip_reviews table
CREATE POLICY "Anyone can view trip reviews" 
ON public.trip_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.trip_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" 
ON public.trip_reviews 
FOR UPDATE 
USING (auth.uid() = reviewer_id)
WITH CHECK (auth.uid() = reviewer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON public.trips(departure_time);
CREATE INDEX IF NOT EXISTS idx_trip_stations_trip_id ON public.trip_stations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_stations_order ON public.trip_stations(trip_id, station_order);
CREATE INDEX IF NOT EXISTS idx_trip_passengers_trip_id ON public.trip_passengers(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_passengers_passenger_id ON public.trip_passengers(passenger_id);
CREATE INDEX IF NOT EXISTS idx_trip_reviews_trip_id ON public.trip_reviews(trip_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update current_passengers count
CREATE OR REPLACE FUNCTION update_trip_passenger_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.trips 
    SET current_passengers = (
      SELECT COUNT(*) 
      FROM public.trip_passengers 
      WHERE trip_id = NEW.trip_id AND status = 'confirmed'
    )
    WHERE id = NEW.trip_id;
    
    -- Update trip status to 'full' if max passengers reached
    UPDATE public.trips 
    SET status = 'full'
    WHERE id = NEW.trip_id 
    AND current_passengers >= max_passengers
    AND status = 'active';
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trips 
    SET current_passengers = (
      SELECT COUNT(*) 
      FROM public.trip_passengers 
      WHERE trip_id = OLD.trip_id AND status = 'confirmed'
    )
    WHERE id = OLD.trip_id;
    
    -- Update trip status back to 'active' if not full anymore
    UPDATE public.trips 
    SET status = 'active'
    WHERE id = OLD.trip_id 
    AND current_passengers < max_passengers
    AND status = 'full';
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for passenger count updates
CREATE TRIGGER update_passenger_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.trip_passengers
FOR EACH ROW
EXECUTE FUNCTION update_trip_passenger_count();

-- Insert sample data
INSERT INTO public.trips (driver_id, title, description, from_location, to_location, departure_time, arrival_time, price, max_passengers, trip_type, vehicle_type, contact_number) VALUES
('00000000-0000-0000-0000-000000000000', 'رحلة من حدائق أكتوبر إلى وسط البلد', 'رحلة يومية من حدائق أكتوبر إلى وسط البلد', 'حدائق أكتوبر', 'وسط البلد', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 25.00, 4, 'regular', 'car', '01234567890'),
('00000000-0000-0000-0000-000000000000', 'رحلة مدرسية - مدرسة الأمل', 'رحلة مدرسية صباحية', 'حي النخيل', 'مدرسة الأمل الابتدائية', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 15.00, 6, 'school', 'van', '01234567891');

-- Insert sample stations for the first trip
INSERT INTO public.trip_stations (trip_id, station_name, station_order, pickup_time, dropoff_time) VALUES
((SELECT id FROM public.trips WHERE title = 'رحلة من حدائق أكتوبر إلى وسط البلد'), 'محطة حدائق أكتوبر', 1, '08:00', NULL),
((SELECT id FROM public.trips WHERE title = 'رحلة من حدائق أكتوبر إلى وسط البلد'), 'محطة النخيل', 2, '08:15', '08:10'),
((SELECT id FROM public.trips WHERE title = 'رحلة من حدائق أكتوبر إلى وسط البلد'), 'محطة وسط البلد', 3, NULL, '09:00');
