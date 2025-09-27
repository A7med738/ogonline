-- إصلاح قيد الجنس في جدول profiles
-- Run this in Supabase SQL Editor

-- 1. عرض القيود الحالية على عمود gender
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname LIKE '%gender%';

-- 2. حذف القيد القديم على gender
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_gender_check;

-- 3. إنشاء قيد جديد يسمح بالقيم العربية
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_gender_check 
CHECK (gender IS NULL OR gender IN ('ذكر', 'أنثى', 'male', 'female', 'Male', 'Female'));

-- 4. اختبار التحديث مرة أخرى
UPDATE public.profiles 
SET 
    full_name = 'Ahmed Al Dosoqi - Test Update 2',
    phone = '0501234567',
    gender = 'ذكر',
    date_of_birth = '1990-01-01',
    address = 'الرياض، المملكة العربية السعودية',
    updated_at = NOW()
WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 5. التحقق من التحديث
SELECT 
    id,
    full_name,
    phone,
    gender,
    date_of_birth,
    address,
    updated_at
FROM public.profiles 
WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 6. التحقق من النتيجة
SELECT 
  CASE 
    WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0' 
        AND gender = 'ذكر'
    )
    THEN 'تم إصلاح قيد الجنس بنجاح! ✅'
    ELSE 'لا تزال هناك مشكلة في قيد الجنس'
  END as result;

-- تم إصلاح قيد الجنس! ✅
