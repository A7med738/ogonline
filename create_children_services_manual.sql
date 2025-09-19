-- إنشاء جدول خدمات الأطفال
CREATE TABLE IF NOT EXISTS children_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('playground', 'kids_area', 'entertainment', 'games', 'art', 'music')),
    address TEXT NOT NULL,
    phone VARCHAR(20),
    phone2 VARCHAR(20),
    whatsapp VARCHAR(20),
    facebook_url TEXT,
    google_maps_url TEXT,
    website TEXT,
    description TEXT,
    image_url TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس على النوع
CREATE INDEX IF NOT EXISTS idx_children_services_type ON children_services(type);

-- إنشاء فهرس على الحالة النشطة
CREATE INDEX IF NOT EXISTS idx_children_services_active ON children_services(is_active);

-- إدراج بيانات تجريبية
INSERT INTO children_services (name, type, address, phone, description, is_active) VALUES
('ملاهي المدينة الترفيهية', 'playground', 'شارع النيل، وسط المدينة', '01234567890', 'ملاهي كبيرة مع ألعاب متنوعة للأطفال من جميع الأعمار', true),
('كيدز ايريا مول المدينة', 'kids_area', 'مول المدينة، الطابق الثاني', '01234567891', 'منطقة أطفال آمنة ومجهزة بأحدث الألعاب التعليمية', true),
('مركز الفنون للأطفال', 'art', 'شارع الفنون، حي الثقافة', '01234567892', 'مركز تعليمي للرسم والفنون اليدوية للأطفال', true),
('أكاديمية الموسيقى الصغيرة', 'music', 'شارع الموسيقى، حي الفنون', '01234567893', 'تعليم الموسيقى والغناء للأطفال من سن 4 سنوات', true),
('منطقة الألعاب التفاعلية', 'games', 'مركز التسوق الكبير، الطابق الأول', '01234567894', 'ألعاب تفاعلية وتكنولوجية للأطفال', true),
('حديقة الألعاب المائية', 'playground', 'حديقة المدينة الكبرى', '01234567895', 'ألعاب مائية ومرافق ترفيهية في الهواء الطلق', true);

-- إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_children_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE TRIGGER trigger_update_children_services_updated_at
    BEFORE UPDATE ON children_services
    FOR EACH ROW
    EXECUTE FUNCTION update_children_services_updated_at();

-- تفعيل Row Level Security
ALTER TABLE children_services ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
CREATE POLICY "Allow public read access to active children services" ON children_services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to insert children services" ON children_services
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update children services" ON children_services
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete children services" ON children_services
    FOR DELETE USING (auth.role() = 'authenticated');
