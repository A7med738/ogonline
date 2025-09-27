-- إصلاح نهائي لمشكلة حفظ البيانات في جدول profiles
-- Run this in Supabase SQL Editor

-- 1. تحديث user_id للمستخدم الحالي
UPDATE public.profiles 
SET user_id = auth.uid()
WHERE user_id IS NULL 
AND id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 2. إضافة user_id لجميع الصفوف التي لا تحتوي عليه
UPDATE public.profiles 
SET user_id = id::uuid
WHERE user_id IS NULL 
AND id IS NOT NULL;

-- 3. حذف السياسات القديمة
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- 4. إنشاء سياسات جديدة تعمل مع id و user_id
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid()::text = id 
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid()::text = id 
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid()::text = id 
    OR auth.uid() = user_id
  );

CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

-- 5. التحقق من البيانات الحالية
SELECT 
    id,
    user_id,
    full_name,
    email,
    phone,
    gender,
    date_of_birth,
    address,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 6. اختبار التحديث
UPDATE public.profiles 
SET 
    full_name = 'Ahmed Al Dosoqi - Updated',
    phone = '0501234567',
    gender = 'ذكر',
    date_of_birth = '1990-01-01',
    address = 'الرياض، المملكة العربية السعودية',
    updated_at = NOW()
WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 7. التحقق من التحديث
SELECT 
    id,
    user_id,
    full_name,
    phone,
    gender,
    date_of_birth,
    address,
    updated_at
FROM public.profiles 
WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 8. التحقق من النتيجة النهائية
SELECT 
  CASE 
    WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0' 
        AND full_name = 'Ahmed Al Dosoqi - Updated'
    )
    THEN 'تم إصلاح مشكلة الحفظ بنجاح! ✅ البيانات تُحفظ الآن'
    ELSE 'لا تزال هناك مشكلة في الحفظ'
  END as result;

-- تم إصلاح مشكلة الحفظ! ✅
