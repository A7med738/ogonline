-- حذف آمن لجميع الجداول والمراجع المتعلقة بالعقارات
-- Run this in Supabase SQL Editor

-- 1. حذف السياسات أولاً (إذا كانت موجودة)
DO $$ 
BEGIN
    -- حذف سياسات جدول properties (إذا كان موجود)
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
END $$;

-- 2. حذف الـ triggers والدوال المرتبطة بالعقارات
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
DROP FUNCTION IF EXISTS update_properties_updated_at() CASCADE;

-- 3. حذف الفهارس المرتبطة بالعقارات (إذا كانت موجودة)
DROP INDEX IF EXISTS idx_properties_owner_id;
DROP INDEX IF EXISTS idx_properties_status;
DROP INDEX IF EXISTS idx_properties_property_type;
DROP INDEX IF EXISTS idx_properties_transaction_type;

-- 4. حذف الجداول المرتبطة بالعقارات (إذا كانت موجودة)
DROP TABLE IF EXISTS user_real_estate_preferences CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- 5. التحقق من النتيجة
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties') 
        AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_real_estate_preferences')
        THEN 'تم حذف جميع جداول العقارات بنجاح! ✅'
        ELSE 'يوجد جداول عقارات لم يتم حذفها'
    END as result;

-- تم حذف جميع المراجع للعقارات بنجاح! ✅
