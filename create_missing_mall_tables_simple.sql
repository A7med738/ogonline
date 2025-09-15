-- Create missing mall tables if they don't exist
-- This fixes the 406 errors for mall_cinema and mall_games

-- Create mall_cinema table if it doesn't exist
CREATE TABLE IF NOT EXISTS mall_cinema (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mall_movies table if it doesn't exist
CREATE TABLE IF NOT EXISTS mall_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cinema_id UUID REFERENCES mall_cinema(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT,
  show_time TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mall_games table if it doesn't exist
CREATE TABLE IF NOT EXISTS mall_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mall_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS mall_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mall_cinema_mall_id ON mall_cinema(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_movies_cinema_id ON mall_movies(cinema_id);
CREATE INDEX IF NOT EXISTS idx_mall_games_mall_id ON mall_games(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_events_mall_id ON mall_events(mall_id);

-- Enable Row Level Security
ALTER TABLE mall_cinema ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_cinema;
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_movies;
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_games;
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_events;

DROP POLICY IF EXISTS "Enable all access for admins" ON mall_cinema;
DROP POLICY IF EXISTS "Enable all access for admins" ON mall_movies;
DROP POLICY IF EXISTS "Enable all access for admins" ON mall_games;
DROP POLICY IF EXISTS "Enable all access for admins" ON mall_events;

-- Create simple policies for public access (read-only for everyone)
CREATE POLICY "Enable read access for all users" ON mall_cinema FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_movies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_games FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_events FOR SELECT USING (true);

-- Create policies for authenticated users (full access for logged-in users)
CREATE POLICY "Enable all access for authenticated users" ON mall_cinema FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all access for authenticated users" ON mall_movies FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all access for authenticated users" ON mall_games FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable all access for authenticated users" ON mall_events FOR ALL USING (auth.uid() IS NOT NULL);
