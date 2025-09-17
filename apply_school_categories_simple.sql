-- تطبيق نظام فئات المدارس - نسخة مبسطة

-- 1. إنشاء جدول فئات المدارس
CREATE TABLE IF NOT EXISTS school_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_school_categories_name_ar ON school_categories(name_ar);
CREATE INDEX IF NOT EXISTS idx_school_categories_is_active ON school_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_school_categories_sort_order ON school_categories(sort_order);

-- 3. إضافة عمود الفئة إلى جدول المدارس
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES school_categories(id);

CREATE INDEX IF NOT EXISTS idx_schools_category_id ON schools(category_id);

-- 4. إدراج الفئات الأساسية
DO $$
BEGIN
    -- إدراج مدارس حكومية
    IF NOT EXISTS (SELECT 1 FROM school_categories WHERE name_ar = 'مدارس حكومية') THEN
        INSERT INTO school_categories (name_ar, name_en, description_ar, description_en, color, icon, sort_order) 
        VALUES ('مدارس حكومية', 'Government Schools', 'المدارس الحكومية التابعة لوزارة التربية والتعليم', 'Government schools under the Ministry of Education', '#10B981', 'school', 1);
    END IF;
    
    -- إدراج مدارس ناشونال
    IF NOT EXISTS (SELECT 1 FROM school_categories WHERE name_ar = 'مدارس ناشونال') THEN
        INSERT INTO school_categories (name_ar, name_en, description_ar, description_en, color, icon, sort_order) 
        VALUES ('مدارس ناشونال', 'National Schools', 'المدارس الناشونال الخاصة', 'Private national schools', '#F59E0B', 'graduation-cap', 2);
    END IF;
    
    -- إدراج مدارس انترناشونال
    IF NOT EXISTS (SELECT 1 FROM school_categories WHERE name_ar = 'مدارس انترناشونال') THEN
        INSERT INTO school_categories (name_ar, name_en, description_ar, description_en, color, icon, sort_order) 
        VALUES ('مدارس انترناشونال', 'International Schools', 'المدارس الدولية', 'International schools', '#8B5CF6', 'globe', 3);
    END IF;
END $$;

-- 5. تحديث المدارس الموجودة لتكون حكومية افتراضياً
UPDATE schools 
SET category_id = (SELECT id FROM school_categories WHERE name_ar = 'مدارس حكومية' LIMIT 1)
WHERE category_id IS NULL;

-- 6. تفعيل RLS
ALTER TABLE school_categories ENABLE ROW LEVEL SECURITY;

-- 7. إنشاء السياسات
CREATE POLICY "Allow public read access to school categories" ON school_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to school categories" ON school_categories
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 8. تحديث سياسة المدارس
DROP POLICY IF EXISTS "Allow public read access to schools" ON schools;
CREATE POLICY "Allow public read access to schools" ON schools
    FOR SELECT USING (
        is_active = true AND 
        (category_id IS NULL OR EXISTS (
            SELECT 1 FROM school_categories 
            WHERE school_categories.id = schools.category_id 
            AND school_categories.is_active = true
        ))
    );

-- 9. إنشاء دالة تحديث الوقت
CREATE OR REPLACE FUNCTION update_school_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. إنشاء trigger
DROP TRIGGER IF EXISTS update_school_categories_updated_at ON school_categories;
CREATE TRIGGER update_school_categories_updated_at
    BEFORE UPDATE ON school_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_school_categories_updated_at();
