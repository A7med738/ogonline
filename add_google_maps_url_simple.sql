-- إضافة عمود رابط خرائط جوجل لجدول مراكز الشرطة
-- قم بتشغيل هذا الملف في Supabase Dashboard

ALTER TABLE police_stations 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- إضافة تعليق على العمود
COMMENT ON COLUMN police_stations.google_maps_url IS 'رابط خرائط جوجل للمركز';

-- مثال على إدراج بيانات تجريبية
-- UPDATE police_stations 
-- SET google_maps_url = 'https://maps.google.com/?q=30.0444,31.2357'
-- WHERE id = 'your-station-id';
