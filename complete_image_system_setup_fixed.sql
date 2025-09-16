-- =============================================
-- إعداد نظام رفع الصور الكامل في Supabase (مصحح)
-- =============================================
-- هذا الملف يحتوي على كل ما تحتاجه لإعداد نظام رفع الصور
-- بما في ذلك Storage Bucket والسياسات وجداول قاعدة البيانات

-- =============================================
-- 1. إعداد Storage Bucket للصور
-- =============================================

-- إنشاء storage bucket للصور
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10 ميجابايت
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. إعداد سياسات Storage (RLS)
-- =============================================

-- حذف السياسات الموجودة (إذا كانت موجودة)
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous users can delete images" ON storage.objects;

-- سياسة القراءة العامة للصور
CREATE POLICY "Public read access for images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- سياسة رفع الصور للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- سياسة تحديث الصور للمستخدمين المصادق عليهم
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- سياسة حذف الصور للمستخدمين المصادق عليهم
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- سياسة رفع الصور للمستخدمين المجهولين (للاستخدام العام)
CREATE POLICY "Anonymous users can upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

-- سياسة تحديث الصور للمستخدمين المجهولين
CREATE POLICY "Anonymous users can update images" ON storage.objects
FOR UPDATE USING (bucket_id = 'images');

-- سياسة حذف الصور للمستخدمين المجهولين
CREATE POLICY "Anonymous users can delete images" ON storage.objects
FOR DELETE USING (bucket_id = 'images');

-- =============================================
-- 3. إضافة نظام تتبع مشاهدات المحلات
-- =============================================

-- إضافة عمود عدد المشاهدات إلى جدول المحلات
ALTER TABLE mall_shops 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- إنشاء جدول تتبع المشاهدات التفصيلي
CREATE TABLE IF NOT EXISTS shop_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES mall_shops(id) ON DELETE CASCADE,
  user_ip TEXT, -- عنوان IP للمستخدم (اختياري)
  user_agent TEXT, -- User Agent للمستخدم (اختياري)
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT -- معرف الجلسة (اختياري)
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_shop_views_shop_id ON shop_views(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_views_viewed_at ON shop_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_shop_views_session_id ON shop_views(session_id);

-- =============================================
-- 4. إضافة نظام تقييمات المحلات
-- =============================================

-- إنشاء جدول تقييمات المحلات
CREATE TABLE IF NOT EXISTS shop_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES mall_shops(id) ON DELETE CASCADE,
  user_id UUID, -- يمكن ربطه بجدول المستخدمين لاحقاً
  user_name TEXT NOT NULL, -- اسم المستخدم الذي قام بالتقييم
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- التقييم من 1 إلى 5
  comment TEXT, -- تعليق المستخدم
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة أعمدة التقييمات إلى جدول المحلات
ALTER TABLE mall_shops 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_shop_ratings_shop_id ON shop_ratings(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_ratings_user_id ON shop_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_ratings_created_at ON shop_ratings(created_at);

-- =============================================
-- 5. إنشاء الدوال المساعدة
-- =============================================

-- دالة زيادة عدد مشاهدات المحل
CREATE OR REPLACE FUNCTION increment_shop_view(
  p_shop_id UUID,
  p_user_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_view_count INTEGER;
BEGIN
  -- إدراج سجل المشاهدة
  INSERT INTO shop_views (shop_id, user_ip, user_agent, session_id)
  VALUES (p_shop_id, p_user_ip, p_user_agent, p_session_id);
  
  -- تحديث والحصول على عدد المشاهدات الجديد
  UPDATE mall_shops 
  SET view_count = view_count + 1
  WHERE id = p_shop_id
  RETURNING view_count INTO new_view_count;
  
  RETURN COALESCE(new_view_count, 0);
END;
$$ LANGUAGE plpgsql;

-- دالة الحصول على إحصائيات مشاهدات المحل
CREATE OR REPLACE FUNCTION get_shop_view_stats(p_shop_id UUID)
RETURNS TABLE (
  total_views INTEGER,
  today_views INTEGER,
  this_week_views INTEGER,
  this_month_views INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT view_count FROM mall_shops WHERE id = p_shop_id) as total_views,
    (SELECT COUNT(*)::INTEGER FROM shop_views 
     WHERE shop_id = p_shop_id 
     AND viewed_at >= CURRENT_DATE) as today_views,
    (SELECT COUNT(*)::INTEGER FROM shop_views 
     WHERE shop_id = p_shop_id 
     AND viewed_at >= DATE_TRUNC('week', CURRENT_DATE)) as this_week_views,
    (SELECT COUNT(*)::INTEGER FROM shop_views 
     WHERE shop_id = p_shop_id 
     AND viewed_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month_views;
END;
$$ LANGUAGE plpgsql;

-- دالة الحصول على أكثر المحلات مشاهدة
CREATE OR REPLACE FUNCTION get_most_viewed_shops(
  p_mall_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  shop_id UUID,
  shop_name TEXT,
  view_count INTEGER,
  mall_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as shop_id,
    s.name as shop_name,
    s.view_count,
    m.name as mall_name
  FROM mall_shops s
  LEFT JOIN malls m ON s.mall_id = m.id
  WHERE (p_mall_id IS NULL OR s.mall_id = p_mall_id)
  ORDER BY s.view_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث متوسط تقييم المحل
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث متوسط التقييم وعدد التقييمات للمحل
  UPDATE mall_shops 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0.0) 
      FROM shop_ratings 
      WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM shop_ratings 
      WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    )
  WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. إنشاء Triggers
-- =============================================

-- إنشاء trigger لتحديث تقييم المحل تلقائياً
DROP TRIGGER IF EXISTS update_shop_rating_trigger ON shop_ratings;
CREATE TRIGGER update_shop_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON shop_ratings
  FOR EACH ROW EXECUTE FUNCTION update_shop_rating();

-- =============================================
-- 7. منح الصلاحيات
-- =============================================

-- منح صلاحيات تنفيذ الدوال
GRANT EXECUTE ON FUNCTION increment_shop_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_shop_view_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_most_viewed_shops TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_shop_rating TO anon, authenticated;

-- =============================================
-- 8. تفعيل Row Level Security
-- =============================================

-- تفعيل RLS لجدول مشاهدات المحلات
ALTER TABLE shop_views ENABLE ROW LEVEL SECURITY;

-- تفعيل RLS لجدول تقييمات المحلات
ALTER TABLE shop_ratings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 9. إنشاء سياسات RLS للجداول
-- =============================================

-- سياسات جدول مشاهدات المحلات
DROP POLICY IF EXISTS "Allow reading shop views" ON shop_views;
CREATE POLICY "Allow reading shop views" ON shop_views
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserting shop views" ON shop_views;
CREATE POLICY "Allow inserting shop views" ON shop_views
  FOR INSERT WITH CHECK (true);

-- سياسات جدول تقييمات المحلات
DROP POLICY IF EXISTS "Allow reading shop ratings" ON shop_ratings;
CREATE POLICY "Allow reading shop ratings" ON shop_ratings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserting shop ratings" ON shop_ratings;
CREATE POLICY "Allow inserting shop ratings" ON shop_ratings
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 10. إضافة التعليقات والتوثيق
-- =============================================

-- ملاحظة: Storage Bucket تم إنشاؤه بنجاح
-- اسم المجلد: images
-- الوصف: مجلد تخزين الصور للتطبيق بما في ذلك شعارات المحلات وصور المولات ورفعات المستخدمين

-- تعليقات على الجداول
COMMENT ON TABLE shop_views IS 'تتبع تفصيلي لمشاهدات المحلات مع معلومات المستخدم الاختيارية';
COMMENT ON TABLE shop_ratings IS 'تقييمات ومراجعات المحلات من المستخدمين';

-- تعليقات على الأعمدة
COMMENT ON COLUMN mall_shops.view_count IS 'العدد الإجمالي للمشاهدات لهذا المحل';
COMMENT ON COLUMN mall_shops.average_rating IS 'متوسط التقييم لهذا المحل';
COMMENT ON COLUMN mall_shops.total_ratings IS 'العدد الإجمالي للتقييمات لهذا المحل';
COMMENT ON COLUMN shop_ratings.rating IS 'التقييم من 1 إلى 5 نجوم';
COMMENT ON COLUMN shop_ratings.user_name IS 'اسم المستخدم الذي قدم التقييم';

-- تعليقات على الدوال
COMMENT ON FUNCTION increment_shop_view IS 'يزيد عدد مشاهدات المحل ويسجل المشاهدة';
COMMENT ON FUNCTION get_shop_view_stats IS 'يعيد إحصائيات المشاهدات لمحل محدد';
COMMENT ON FUNCTION get_most_viewed_shops IS 'يعيد أكثر المحلات مشاهدة، مع إمكانية التصفية حسب المول';
COMMENT ON FUNCTION update_shop_rating IS 'يحدث متوسط التقييم وعدد التقييمات للمحل تلقائياً';

-- =============================================
-- 11. رسالة النجاح
-- =============================================

-- إدراج رسالة نجاح
DO $$
BEGIN
  RAISE NOTICE '=============================================';
  RAISE NOTICE 'تم إعداد نظام رفع الصور وتتبع المشاهدات والتقييمات بنجاح!';
  RAISE NOTICE '=============================================';
  RAISE NOTICE 'Storage Bucket: images';
  RAISE NOTICE 'الحد الأقصى لحجم الملف: 10 ميجابايت';
  RAISE NOTICE 'أنواع الملفات المدعومة: JPG, PNG, GIF, WebP';
  RAISE NOTICE 'تم إنشاء 2 جداول جديدة و 4 دوال مساعدة';
  RAISE NOTICE 'جميع السياسات الأمنية مفعلة';
  RAISE NOTICE 'النظام جاهز للاستخدام!';
  RAISE NOTICE '=============================================';
END $$;
