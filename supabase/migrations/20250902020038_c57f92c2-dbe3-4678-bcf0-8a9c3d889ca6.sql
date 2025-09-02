-- Add location fields to police_stations table
ALTER TABLE public.police_stations 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add location fields to city_departments table  
ALTER TABLE public.city_departments
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);