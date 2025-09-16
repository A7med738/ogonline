-- إضافة عمود رابط خرائط جوجل لجدول أجهزة المدينة
-- قم بتشغيل هذا الملف في Supabase Dashboard

ALTER TABLE city_departments 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- إضافة تعليق على العمود
COMMENT ON COLUMN city_departments.google_maps_url IS 'رابط خرائط جوجل للجهاز';

-- مثال على إدراج بيانات تجريبية
-- UPDATE city_departments 
-- SET google_maps_url = 'https://maps.google.com/?q=30.0444,31.2357'
-- WHERE id = 'your-department-id';
