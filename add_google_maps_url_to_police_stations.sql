-- إضافة عمود رابط خرائط جوجل لجدول مراكز الشرطة
ALTER TABLE police_stations 
ADD COLUMN google_maps_url TEXT;

-- تعليق على العمود الجديد
COMMENT ON COLUMN police_stations.google_maps_url IS 'رابط خرائط جوجل للمركز';
