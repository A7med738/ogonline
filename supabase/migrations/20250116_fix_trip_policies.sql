-- Fix infinite recursion in trip policies
-- This migration fixes the RLS policies that were causing infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view trip passengers" ON public.trip_passengers;
DROP POLICY IF EXISTS "Trip drivers can manage stations" ON public.trip_stations;

-- Create simplified policies without recursion
CREATE POLICY "Users can view their own trips" 
ON public.trips 
FOR SELECT 
USING (auth.uid() = driver_id);

CREATE POLICY "Users can view trips they are passengers in" 
ON public.trips 
FOR SELECT 
USING (auth.uid() IN (
  SELECT passenger_id FROM public.trip_passengers 
  WHERE trip_id = trips.id AND passenger_id = auth.uid()
));

-- Simplified trip_stations policy
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

-- Simplified trip_passengers policy
CREATE POLICY "Users can view trip passengers" 
ON public.trip_passengers 
FOR SELECT 
USING (auth.uid() = (
  SELECT driver_id FROM public.trips 
  WHERE id = trip_passengers.trip_id
) OR auth.uid() = passenger_id);

-- Update trip_passengers management policy
DROP POLICY IF EXISTS "Trip drivers can manage passengers" ON public.trip_passengers;
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
