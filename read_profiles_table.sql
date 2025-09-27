-- قراءة جدول profiles
-- Run this in Supabase SQL Editor

-- 1. عرض هيكل جدول profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. عرض عدد الصفوف في الجدول
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 3. عرض عينة من البيانات (أول 10 صفوف)
SELECT 
    id,
    full_name,
    first_name,
    last_name,
    email,
    phone,
    gender,
    date_of_birth,
    address,
    city,
    avatar_url,
    created_at,
    updated_at
FROM public.profiles 
LIMIT 10;

-- 4. عرض إحصائيات الجدول
SELECT 
    'Total Profiles' as metric,
    COUNT(*) as value
FROM public.profiles
UNION ALL
SELECT 
    'Profiles with Full Name',
    COUNT(*)
FROM public.profiles 
WHERE full_name IS NOT NULL AND full_name != ''
UNION ALL
SELECT 
    'Profiles with Email',
    COUNT(*)
FROM public.profiles 
WHERE email IS NOT NULL AND email != ''
UNION ALL
SELECT 
    'Profiles with Phone',
    COUNT(*)
FROM public.profiles 
WHERE phone IS NOT NULL AND phone != ''
UNION ALL
SELECT 
    'Profiles with Avatar',
    COUNT(*)
FROM public.profiles 
WHERE avatar_url IS NOT NULL AND avatar_url != '';

-- 5. عرض أحدث 5 ملفات شخصية
SELECT 
    id,
    full_name,
    email,
    created_at,
    updated_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. التحقق من وجود user_id column
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) 
        THEN 'user_id column exists ✅'
        ELSE 'user_id column missing ❌'
    END as user_id_status;

-- 7. عرض السياسات (Policies) للجدول
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 8. عرض الفهارس (Indexes) للجدول
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- تم قراءة جدول profiles بنجاح! ✅
