-- إصلاح نهائي لقاعدة البيانات
-- Run this in Supabase SQL Editor

-- 1. حذف جميع السياسات الموجودة أولاً
DO $$ 
BEGIN
    -- حذف سياسات user_news_activity
    DROP POLICY IF EXISTS "Users can view their own news activity" ON public.user_news_activity;
    DROP POLICY IF EXISTS "Users can insert their own news activity" ON public.user_news_activity;
    DROP POLICY IF EXISTS "Users can update their own news activity" ON public.user_news_activity;
    
    -- حذف سياسات user_roles
    DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
    
    -- حذف سياسات profiles
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
END $$;

-- 2. إعادة إنشاء الجداول من الصفر
DROP TABLE IF EXISTS public.user_news_activity CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 3. إنشاء جدول user_news_activity
CREATE TABLE public.user_news_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. إنشاء جدول user_roles
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 5. إصلاح جدول profiles
DO $$ 
BEGIN
    -- إضافة user_id إذا لم يكن موجود
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- إضافة constraint إذا لم يكن موجود
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_user_id_unique') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE(user_id);
    END IF;
END $$;

-- 6. إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_user_news_activity_user_id ON public.user_news_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 7. تمكين RLS
ALTER TABLE public.user_news_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. إنشاء سياسات بسيطة وآمنة
-- سياسات user_news_activity
CREATE POLICY "Enable read access for users based on user_id" ON public.user_news_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON public.user_news_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.user_news_activity
  FOR UPDATE USING (auth.uid() = user_id);

-- سياسات user_roles
CREATE POLICY "Enable read access for users based on user_id" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for all users" ON public.user_roles
  FOR SELECT USING (true);

-- سياسات profiles
CREATE POLICY "Enable read access for users based on user_id" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT USING (true);

-- 9. إنشاء دالة updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. حذف الـ triggers القديمة أولاً
DROP TRIGGER IF EXISTS update_user_news_activity_updated_at ON public.user_news_activity;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- 11. إنشاء triggers جديدة
CREATE TRIGGER update_user_news_activity_updated_at 
  BEFORE UPDATE ON public.user_news_activity 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
  BEFORE UPDATE ON public.user_roles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 12. إدراج بيانات تجريبية للمستخدم الحالي (إذا لم تكن موجودة)
DO $$ 
DECLARE
    current_user_id UUID;
BEGIN
    -- الحصول على معرف المستخدم الحالي
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NOT NULL THEN
        -- إدراج في user_news_activity
        INSERT INTO public.user_news_activity (user_id, last_visited_at)
        VALUES (current_user_id, NOW())
        ON CONFLICT (user_id) DO NOTHING;
        
        -- إدراج في user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (current_user_id, 'user')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- إدراج في profiles
        INSERT INTO public.profiles (user_id, full_name, created_at, updated_at)
        VALUES (current_user_id, 'مستخدم جديد', NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

-- 13. التحقق من النتيجة
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_news_activity')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles')
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id')
    THEN 'تم إصلاح قاعدة البيانات بنجاح! ✅'
    ELSE 'يوجد مشاكل في قاعدة البيانات'
  END as result;

-- تم إصلاح قاعدة البيانات! ✅
