-- حذف جميع الجداول والمراجع المتعلقة بالعقارات
-- Run this in Supabase SQL Editor

-- 1. حذف الجداول المرتبطة بالعقارات (إذا كانت موجودة)
DROP TABLE IF EXISTS user_real_estate_preferences CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- 2. حذف السياسات المرتبطة بالعقارات (إذا كانت موجودة)
DROP POLICY IF EXISTS "Anyone can view approved properties" ON properties;
DROP POLICY IF EXISTS "Users can view their own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Users can update their own pending properties" ON properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON properties;
DROP POLICY IF EXISTS "Admins can update any property" ON properties;
DROP POLICY IF EXISTS "Admin users can update any property" ON properties;
DROP POLICY IF EXISTS "Authenticated users can update properties" ON properties;

-- 3. حذف الدوال المرتبطة بالعقارات
DROP FUNCTION IF EXISTS update_properties_updated_at();

-- 4. حذف الفهارس المرتبطة بالعقارات
DROP INDEX IF EXISTS idx_properties_owner_id;
DROP INDEX IF EXISTS idx_properties_status;
DROP INDEX IF EXISTS idx_properties_property_type;
DROP INDEX IF EXISTS idx_properties_transaction_type;

-- تم حذف جميع المراجع للعقارات بنجاح! ✅
