-- Apply Worship Places Migration
-- Run this in Supabase Dashboard SQL Editor

-- Create worship_places table
CREATE TABLE IF NOT EXISTS worship_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- مسجد، كنيسة، معبد
  address TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  prayer_times JSONB, -- أوقات الصلاة
  services JSONB, -- الخدمات المتاحة
  capacity INTEGER,
  is_accessible BOOLEAN DEFAULT true, -- إمكانية الوصول للمعاقين
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create worship_place_events table
CREATE TABLE IF NOT EXISTS worship_place_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worship_place_id UUID REFERENCES worship_places(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT,
  event_time TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create worship_place_services table
CREATE TABLE IF NOT EXISTS worship_place_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worship_place_id UUID REFERENCES worship_places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_worship_place_events_worship_place_id ON worship_place_events(worship_place_id);
CREATE INDEX IF NOT EXISTS idx_worship_place_services_worship_place_id ON worship_place_services(worship_place_id);

-- Create updated_at trigger
CREATE TRIGGER update_worship_places_updated_at 
  BEFORE UPDATE ON worship_places 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO worship_places (name, type, address, phone, description, image_url, logo_url, prayer_times, services, capacity, is_accessible) VALUES 
('مسجد النور', 'مسجد', 'شارع النور، حدائق أكتوبر', '01001234567', 'مسجد حديث يخدم المجتمع المحلي', '/placeholder.svg', '/placeholder.svg', 
 '{"الفجر": "5:30", "الظهر": "12:00", "العصر": "3:30", "المغرب": "6:00", "العشاء": "7:30"}',
 '["تعليم القرآن", "دروس دينية", "إفطار رمضان", "زكاة الفطر"]', 500, true);

-- Get the worship place ID for sample data
DO $$ 
DECLARE 
  worship_uuid UUID;
BEGIN 
  -- Get the worship place ID
  SELECT id INTO worship_uuid FROM worship_places WHERE name = 'مسجد النور' LIMIT 1;
  
  -- Insert events
  INSERT INTO worship_place_events (worship_place_id, title, description, event_date, event_time, image_url) VALUES 
  (worship_uuid, 'درس ديني أسبوعي', 'درس في تفسير القرآن الكريم', 'كل جمعة', '8:00 مساءً', '/placeholder.svg'),
  (worship_uuid, 'إفطار جماعي', 'إفطار جماعي في رمضان', 'رمضان', '6:30 مساءً', '/placeholder.svg');
  
  -- Insert services
  INSERT INTO worship_place_services (worship_place_id, name, description, icon) VALUES 
  (worship_uuid, 'تعليم القرآن', 'حفظ وتلاوة القرآن الكريم', 'BookOpen'),
  (worship_uuid, 'دروس دينية', 'دروس في العقيدة والفقه', 'GraduationCap'),
  (worship_uuid, 'إفطار رمضان', 'إفطار جماعي في رمضان', 'Utensils');
END $$;
