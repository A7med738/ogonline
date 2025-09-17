-- =============================================
-- إصلاح الصفحات المتبقية
-- =============================================

-- هذا الملف يحتوي على تعليمات لإصلاح الصفحات المتبقية:
-- 1. CityServicesCivilRegistry.tsx
-- 2. CityServicesCourts.tsx

-- يجب تطبيق نفس التغييرات التالية على كل صفحة:

-- 1. تغيير الـ imports:
-- من: import React from 'react';
-- إلى: import React, { useState, useEffect } from 'react';

-- 2. إضافة imports جديدة:
-- import { supabase } from '@/integrations/supabase/client';
-- import { toast } from 'sonner';

-- 3. إضافة interface للخدمة:
-- interface ServiceName {
--   id: string;
--   name: string;
--   description?: string;
--   phone: string;
--   address: string;
--   operating_hours: string;
--   services: string[];
--   image_url?: string;
--   logo_url?: string;
--   google_maps_url?: string;
-- }

-- 4. تغيير البيانات الثابتة إلى state:
-- const [services, setServices] = useState<ServiceName[]>([]);
-- const [loading, setLoading] = useState(true);

-- 5. إضافة useEffect و fetchServices function

-- 6. تحديث handleLocation لدعم google_maps_url

-- 7. استبدال عرض البيانات الثابتة بعرض البيانات من قاعدة البيانات
-- مع إضافة loading state و empty state

-- 8. إضافة دعم للصور والشعارات

-- ملاحظة: تم تطبيق هذه التغييرات بالفعل على:
-- ✅ CityServicesCityCenter.tsx
-- ✅ CityServicesFamilyCourt.tsx  
-- ✅ CityServicesWholesaleMarket.tsx
-- ✅ CityServicesTraffic.tsx (كان يستخدم قاعدة البيانات بالفعل)

-- المتبقي:
-- ❌ CityServicesCivilRegistry.tsx
-- ❌ CityServicesCourts.tsx
