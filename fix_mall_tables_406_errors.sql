-- Fix 406 errors by creating missing mall tables
-- This script creates the missing mall_cinema and mall_games tables
-- and sets up proper Row Level Security policies

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

-- Enable Row Level Security on all tables
ALTER TABLE mall_cinema ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_cinema;
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_movies;
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_games;
DROP POLICY IF EXISTS "Enable read access for all users" ON mall_events;
DROP POLICY IF EXISTS "Enable all access for admins" ON mall_cinema;
DROP POLICY IF EXISTS "Enable all access for admins" ON mall_movies;
DROP POLICY IF EXISTS "Enable all access for admins" ON mall_games;
DROP POLICY IF EXISTS "Enable all access for admins" ON mall_events;

-- Create public read policies for all users
CREATE POLICY "Enable read access for all users" ON mall_cinema FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_movies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_games FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_events FOR SELECT USING (true);

-- Create admin-only write policies (if user_roles table exists)
-- Check if user_roles table exists first
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        -- Create admin policies
        EXECUTE 'CREATE POLICY "Enable all access for admins" ON mall_cinema FOR ALL USING (
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role = ''admin''
            )
        )';
        
        EXECUTE 'CREATE POLICY "Enable all access for admins" ON mall_movies FOR ALL USING (
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role = ''admin''
            )
        )';
        
        EXECUTE 'CREATE POLICY "Enable all access for admins" ON mall_games FOR ALL USING (
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role = ''admin''
            )
        )';
        
        EXECUTE 'CREATE POLICY "Enable all access for admins" ON mall_events FOR ALL USING (
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND role = ''admin''
            )
        )';
    ELSE
        -- If no user_roles table, create basic policies for authenticated users
        EXECUTE 'CREATE POLICY "Enable all access for authenticated users" ON mall_cinema FOR ALL USING (auth.role() = ''authenticated'')';
        EXECUTE 'CREATE POLICY "Enable all access for authenticated users" ON mall_movies FOR ALL USING (auth.role() = ''authenticated'')';
        EXECUTE 'CREATE POLICY "Enable all access for authenticated users" ON mall_games FOR ALL USING (auth.role() = ''authenticated'')';
        EXECUTE 'CREATE POLICY "Enable all access for authenticated users" ON mall_events FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
END $$;

-- Verify tables were created successfully
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('mall_cinema', 'mall_movies', 'mall_games', 'mall_events')
ORDER BY table_name;
