-- Enable Row Level Security on all mall-related tables that are currently missing it
-- This fixes the critical security vulnerability where RLS was disabled

-- Enable RLS on all mall tables
ALTER TABLE malls ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_cinema ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_events ENABLE ROW LEVEL SECURITY;

-- Create public read policies for mall data (publicly viewable content)
CREATE POLICY "Enable read access for all users" ON malls FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_services FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_shops FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_restaurants FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_cinema FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_movies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_games FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON mall_events FOR SELECT USING (true);

-- Create admin-only write policies
CREATE POLICY "Enable all access for admins" ON malls FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Enable all access for admins" ON mall_services FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Enable all access for admins" ON mall_shops FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Enable all access for admins" ON mall_restaurants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Enable all access for admins" ON mall_cinema FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Enable all access for admins" ON mall_movies FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Enable all access for admins" ON mall_games FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Enable all access for admins" ON mall_events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);