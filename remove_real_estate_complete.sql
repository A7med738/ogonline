-- حذف شامل وآمن لجميع الجداول والمراجع المتعلقة بالعقارات
-- Run this in Supabase SQL Editor

-- 1. حذف الـ triggers أولاً
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;

-- 2. حذف الدوال مع CASCADE
DROP FUNCTION IF EXISTS update_properties_updated_at() CASCADE;

-- 3. حذف السياسات (إذا كانت الجداول موجودة)
DO $$ 
BEGIN
    -- حذف سياسات جدول properties
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') THEN
        DROP POLICY IF EXISTS "Anyone can view approved properties" ON properties;
        DROP POLICY IF EXISTS "Users can view their own properties" ON properties;
        DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
        DROP POLICY IF EXISTS "Users can update their own pending properties" ON properties;
        DROP POLICY IF EXISTS "Admins can view all properties" ON properties;
        DROP POLICY IF EXISTS "Admins can update any property" ON properties;
        DROP POLICY IF EXISTS "Admin users can update any property" ON properties;
        DROP POLICY IF EXISTS "Authenticated users can update properties" ON properties;
    END IF;
    
    -- حذف سياسات جدول user_real_estate_preferences
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_real_estate_preferences') THEN
        DROP POLICY IF EXISTS "Users can view their own preferences" ON user_real_estate_preferences;
        DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_real_estate_preferences;
        DROP POLICY IF EXISTS "Users can update their own preferences" ON user_real_estate_preferences;
    END IF;
END $$;

-- 4. حذف الفهارس (إذا كانت موجودة)
DROP INDEX IF EXISTS idx_properties_owner_id;
DROP INDEX IF EXISTS idx_properties_status;
DROP INDEX IF EXISTS idx_properties_property_type;
DROP INDEX IF EXISTS idx_properties_transaction_type;
DROP INDEX IF EXISTS idx_user_real_estate_preferences_user_id;

-- 5. حذف الجداول مع CASCADE (لحذف جميع التبعيات)
DROP TABLE IF EXISTS user_real_estate_preferences CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- 6. حذف أي دوال أخرى مرتبطة بالعقارات
DROP FUNCTION IF EXISTS get_property_contact(text) CASCADE;
DROP FUNCTION IF EXISTS increment_property_likes(text) CASCADE;
DROP FUNCTION IF EXISTS increment_property_views(text) CASCADE;

-- 7. التحقق من النتيجة النهائية
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') 
        AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_real_estate_preferences')
        AND NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'update_properties_updated_at')
        THEN 'تم حذف جميع جداول العقارات والمراجع بنجاح! ✅'
        ELSE 'يوجد بعض المراجع لم يتم حذفها - تحقق من النتائج أدناه'
    END as result;

-- 8. عرض الجداول المتبقية (للتأكد)
SELECT 
    table_name,
    'جدول متبقي' as status
FROM information_schema.tables 
WHERE table_name IN ('properties', 'user_real_estate_preferences')
AND table_schema = 'public';

-- 9. عرض الدوال المتبقية (للتأكد)
SELECT 
    routine_name,
    'دالة متبقية' as status
FROM information_schema.routines 
WHERE routine_name LIKE '%property%'
AND routine_schema = 'public';

-- تم حذف جميع المراجع للعقارات بنجاح! ✅
