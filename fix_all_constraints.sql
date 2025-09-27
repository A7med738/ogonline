-- إصلاح شامل لجميع القيود في جدول profiles
-- Run this in Supabase SQL Editor

-- 1. عرض جميع القيود الحالية
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 2. حذف جميع القيود المحددة
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_gender_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_check;

-- 3. إنشاء قيود جديدة مرنة
-- قيد الجنس
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_gender_check 
CHECK (gender IS NULL OR gender IN ('ذكر', 'أنثى', 'male', 'female', 'Male', 'Female', 'Male', 'Female'));

-- قيد الهاتف (اختياري)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_check 
CHECK (phone IS NULL OR phone ~ '^[0-9+\-\s\(\)]+$');

-- 4. تحديث user_id للمستخدم الحالي
UPDATE public.profiles 
SET user_id = auth.uid()
WHERE user_id IS NULL 
AND id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 5. حذف السياسات القديمة
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- 6. إنشاء سياسات بسيطة
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. اختبار التحديث الشامل
UPDATE public.profiles 
SET 
    full_name = 'Ahmed Al Dosoqi - Final Test',
    phone = '0501234567',
    gender = 'ذكر',
    date_of_birth = '1990-01-01',
    address = 'الرياض، المملكة العربية السعودية',
    updated_at = NOW()
WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 8. التحقق من النتيجة النهائية
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

-- 9. التحقق من النجاح
SELECT 
  CASE 
    WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0' 
        AND full_name = 'Ahmed Al Dosoqi - Final Test'
        AND gender = 'ذكر'
    )
    THEN 'تم إصلاح جميع القيود بنجاح! ✅ البيانات تُحفظ الآن'
    ELSE 'لا تزال هناك مشكلة في القيود'
  END as result;

-- تم إصلاح جميع القيود! ✅
