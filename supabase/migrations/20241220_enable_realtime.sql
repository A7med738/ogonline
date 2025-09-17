-- تفعيل Realtime على جدول عداد الزوار (إذا لم يكن موجوداً بالفعل)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'visitor_counter'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE visitor_counter;
    END IF;
END $$;

-- إعطاء صلاحيات Realtime
GRANT SELECT ON visitor_counter TO anon;
GRANT SELECT ON visitor_counter TO authenticated;

-- التأكد من أن الجدول موجود
INSERT INTO visitor_counter (id, counter_value) 
VALUES (1, 0) 
ON CONFLICT (id) DO NOTHING;
