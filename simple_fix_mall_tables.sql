-- Simple fix for 406 errors - Run this in Supabase SQL Editor
-- This creates the missing tables and basic policies

-- Create mall_cinema table
CREATE TABLE IF NOT EXISTS mall_cinema (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mall_movies table
CREATE TABLE IF NOT EXISTS mall_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cinema_id UUID REFERENCES mall_cinema(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT,
  show_time TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mall_games table
CREATE TABLE IF NOT EXISTS mall_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mall_events table
CREATE TABLE IF NOT EXISTS mall_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mall_cinema ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_cinema;
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_movies;
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_games;
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_events;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON mall_cinema;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON mall_movies;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON mall_games;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON mall_events;

-- Create basic read policies
CREATE POLICY "Enable read access for all users" ON mall_cinema FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_movies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_games FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_events FOR SELECT USING (true);

-- Create basic write policies for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON mall_cinema FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON mall_movies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON mall_games FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON mall_events FOR ALL USING (auth.role() = 'authenticated');
