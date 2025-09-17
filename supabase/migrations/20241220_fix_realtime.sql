-- التأكد من وجود الجدول مع القيمة الصحيحة
INSERT INTO visitor_counter (id, counter_value) 
VALUES (1, 0) 
ON CONFLICT (id) DO NOTHING;

-- التأكد من الصلاحيات
GRANT SELECT ON visitor_counter TO anon;
GRANT SELECT ON visitor_counter TO authenticated;
GRANT UPDATE ON visitor_counter TO anon;
GRANT UPDATE ON visitor_counter TO authenticated;
