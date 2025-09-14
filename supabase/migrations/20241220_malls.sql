-- Create malls table
CREATE TABLE IF NOT EXISTS malls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  is_open BOOLEAN DEFAULT true,
  closing_time TEXT DEFAULT '11:00 مساءً',
  rating DECIMAL(2,1) DEFAULT 0.0,
  image_url TEXT,
  logo_url TEXT,
  about TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mall_services table
CREATE TABLE IF NOT EXISTS mall_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mall_shops table
CREATE TABLE IF NOT EXISTS mall_shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  floor TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mall_restaurants table
CREATE TABLE IF NOT EXISTS mall_restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuisine TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mall_services_mall_id ON mall_services(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_shops_mall_id ON mall_shops(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_mall_id ON mall_restaurants(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_cinema_mall_id ON mall_cinema(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_movies_cinema_id ON mall_movies(cinema_id);
CREATE INDEX IF NOT EXISTS idx_mall_games_mall_id ON mall_games(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_events_mall_id ON mall_events(mall_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_malls_updated_at BEFORE UPDATE ON malls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO malls (name, description, address, phone, website, is_open, closing_time, rating, image_url, logo_url, about) VALUES
('مول حدائق أكتوبر', 'أكبر مركز تجاري في المنطقة', 'حدائق أكتوبر، الجيزة', '01001234567', 'octobergardensmall.com', true, '11:00 مساءً', 4.5, '/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png', '/placeholder.svg', 'مول حدائق أكتوبر هو أحد أكبر المراكز التجارية في المنطقة، يضم أكثر من 200 محل تجاري ومطعم، ويوفر تجربة تسوق متكاملة لجميع أفراد العائلة.');

-- Get the mall ID for sample data
DO $$
DECLARE
    mall_uuid UUID;
    cinema_uuid UUID;
BEGIN
    -- Get the mall ID
    SELECT id INTO mall_uuid FROM malls WHERE name = 'مول حدائق أكتوبر' LIMIT 1;
    
    -- Insert services
    INSERT INTO mall_services (mall_id, name, icon) VALUES
    (mall_uuid, 'Wi-Fi مجاني', 'Wifi'),
    (mall_uuid, 'مواقف سيارات', 'Car'),
    (mall_uuid, 'غرف صلاة', 'Heart'),
    (mall_uuid, 'خدمات بنكية', 'CreditCard');
    
    -- Insert shops
    INSERT INTO mall_shops (mall_id, name, category, floor, logo_url) VALUES
    (mall_uuid, 'H&M', 'أزياء', 'الطابق الأول', '/placeholder.svg'),
    (mall_uuid, 'Zara', 'أزياء', 'الطابق الأول', '/placeholder.svg'),
    (mall_uuid, 'Samsung', 'إلكترونيات', 'الطابق الثاني', '/placeholder.svg');
    
    -- Insert restaurants
    INSERT INTO mall_restaurants (mall_id, name, cuisine, logo_url) VALUES
    (mall_uuid, 'ماكدونالدز', 'وجبات سريعة', '/placeholder.svg'),
    (mall_uuid, 'بيتزا هت', 'إيطالي', '/placeholder.svg');
    
    -- Insert cinema
    INSERT INTO mall_cinema (mall_id, name) VALUES
    (mall_uuid, 'سينما سيتي سكيب');
    
    -- Get cinema ID
    SELECT id INTO cinema_uuid FROM mall_cinema WHERE mall_id = mall_uuid LIMIT 1;
    
    -- Insert movies
    INSERT INTO mall_movies (cinema_id, title, genre, show_time, image_url) VALUES
    (cinema_uuid, 'فيلم الأكشن الجديد', 'أكشن', '8:00 PM', '/placeholder.svg'),
    (cinema_uuid, 'كوميديا عائلية', 'كوميديا', '10:00 PM', '/placeholder.svg');
    
    -- Insert games
    INSERT INTO mall_games (mall_id, name, description, image_url) VALUES
    (mall_uuid, 'Magic Planet', 'منطقة ألعاب للأطفال والعائلات', '/placeholder.svg');
    
    -- Insert events
    INSERT INTO mall_events (mall_id, title, event_date, image_url) VALUES
    (mall_uuid, 'عرض موسيقي', '15 يناير', '/placeholder.svg'),
    (mall_uuid, 'مهرجان الطعام', '20 يناير', '/placeholder.svg');
END $$;
