-- حل بسيط لأخطاء 406 - بدون تعارض مع السياسات الموجودة
-- انسخ والصق هذا في Supabase SQL Editor

-- إنشاء الجداول المفقودة فقط
CREATE TABLE IF NOT EXISTS mall_cinema (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mall_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cinema_id UUID REFERENCES mall_cinema(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT,
  show_time TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mall_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mall_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mall_id UUID REFERENCES malls(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE mall_cinema ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_events ENABLE ROW LEVEL SECURITY;

-- إنشاء السياسات فقط إذا لم تكن موجودة
DO $$
BEGIN
    -- سياسات القراءة
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mall_cinema' AND policyname = 'Enable read access for all users') THEN
        EXECUTE 'CREATE POLICY "Enable read access for all users" ON mall_cinema FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mall_movies' AND policyname = 'Enable read access for all users') THEN
        EXECUTE 'CREATE POLICY "Enable read access for all users" ON mall_movies FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mall_games' AND policyname = 'Enable read access for all users') THEN
        EXECUTE 'CREATE POLICY "Enable read access for all users" ON mall_games FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mall_events' AND policyname = 'Enable read access for all users') THEN
        EXECUTE 'CREATE POLICY "Enable read access for all users" ON mall_events FOR SELECT USING (true)';
    END IF;
    
    -- سياسات الكتابة
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mall_cinema' AND policyname = 'Enable all access for authenticated users') THEN
        EXECUTE 'CREATE POLICY "Enable all access for authenticated users" ON mall_cinema FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mall_movies' AND policyname = 'Enable all access for authenticated users') THEN
        EXECUTE 'CREATE POLICY "Enable all access for authenticated users" ON mall_movies FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mall_games' AND policyname = 'Enable all access for authenticated users') THEN
        EXECUTE 'CREATE POLICY "Enable all access for authenticated users" ON mall_games FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mall_events' AND policyname = 'Enable all access for authenticated users') THEN
        EXECUTE 'CREATE POLICY "Enable all access for authenticated users" ON mall_events FOR ALL USING (auth.role() = ''authenticated'')';
    END IF;
END $$;

-- التحقق من إنشاء الجداول
SELECT 
    table_name,
    'Created Successfully' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('mall_cinema', 'mall_movies', 'mall_games', 'mall_events')
ORDER BY table_name;
