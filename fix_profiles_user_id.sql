-- إصلاح مشكلة user_id في جدول profiles
-- Run this in Supabase SQL Editor

-- 1. تحديث user_id للمستخدم الحالي
UPDATE public.profiles 
SET user_id = auth.uid()
WHERE user_id IS NULL 
AND id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 2. التحقق من التحديث
SELECT 
    id,
    user_id,
    full_name,
    email,
    phone,
    gender,
    date_of_birth,
    address
FROM public.profiles 
WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0';

-- 3. إصلاح السياسات لتعمل مع id بدلاً من user_id
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 4. إنشاء سياسات جديدة تعمل مع id
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid()::text = id::text OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text OR auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid()::text = id::text OR auth.uid() = user_id);

-- 5. التحقق من النتيجة
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = 'ece168da-8e10-46ab-aab7-66f7da172eb0' AND user_id IS NOT NULL)
    THEN 'تم إصلاح user_id بنجاح! ✅'
    ELSE 'فشل في إصلاح user_id'
  END as result;

-- تم إصلاح مشكلة user_id! ✅
