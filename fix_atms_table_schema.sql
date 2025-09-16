-- إصلاح جدول الصرافات الآلية
-- قم بتشغيل هذا الملف في Supabase Dashboard

-- التحقق من وجود الجدول وإضافة الأعمدة المفقودة
CREATE TABLE IF NOT EXISTS atms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bank_name TEXT, -- جعل bank_name اختياري
  address TEXT,
  phone TEXT,
  services TEXT[],
  operating_hours TEXT,
  accessibility_features TEXT[],
  languages TEXT[],
  fees TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إذا كان الجدول موجود بالفعل، قم بتعديل العمود
ALTER TABLE atms ALTER COLUMN bank_name DROP NOT NULL;

-- إضافة تعليقات على الأعمدة
COMMENT ON TABLE atms IS 'جدول الصرافات الآلية';
COMMENT ON COLUMN atms.name IS 'اسم الصراف الآلي';
COMMENT ON COLUMN atms.bank_name IS 'اسم البنك';
COMMENT ON COLUMN atms.address IS 'العنوان';
COMMENT ON COLUMN atms.phone IS 'رقم الهاتف';
COMMENT ON COLUMN atms.services IS 'الخدمات المتاحة';
COMMENT ON COLUMN atms.operating_hours IS 'ساعات العمل';
COMMENT ON COLUMN atms.accessibility_features IS 'ميزات إمكانية الوصول';
COMMENT ON COLUMN atms.languages IS 'اللغات المدعومة';
COMMENT ON COLUMN atms.fees IS 'الرسوم';
COMMENT ON COLUMN atms.is_active IS 'نشط أم لا';
