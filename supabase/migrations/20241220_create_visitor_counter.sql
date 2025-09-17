-- إنشاء جدول عداد الزوار الموحد
CREATE TABLE IF NOT EXISTS visitor_counter (
  id SERIAL PRIMARY KEY,
  counter_value INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج قيمة أولية للعداد
INSERT INTO visitor_counter (counter_value) 
VALUES (0) 
ON CONFLICT DO NOTHING;

-- إنشاء دالة لزيادة العداد
CREATE OR REPLACE FUNCTION increment_visitor_counter()
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- زيادة العداد بمقدار 1
  UPDATE visitor_counter 
  SET counter_value = counter_value + 1, last_updated = NOW()
  WHERE id = 1;
  
  -- الحصول على القيمة الجديدة
  SELECT counter_value INTO new_count FROM visitor_counter WHERE id = 1;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة للحصول على قيمة العداد الحالية
CREATE OR REPLACE FUNCTION get_visitor_counter()
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT counter_value INTO current_count FROM visitor_counter WHERE id = 1;
  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql;

-- إعطاء صلاحيات للمستخدمين
GRANT SELECT, UPDATE ON visitor_counter TO authenticated;
GRANT EXECUTE ON FUNCTION increment_visitor_counter() TO authenticated;
GRANT EXECUTE ON FUNCTION get_visitor_counter() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_visitor_counter() TO anon;
GRANT EXECUTE ON FUNCTION get_visitor_counter() TO anon;
