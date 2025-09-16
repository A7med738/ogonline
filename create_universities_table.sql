-- إنشاء جدول الجامعات
CREATE TABLE IF NOT EXISTS universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'international', 'technical', 'other')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  established_year INTEGER,
  accreditation TEXT,
  faculties TEXT[] DEFAULT '{}',
  programs TEXT[] DEFAULT '{}',
  admission_requirements TEXT[] DEFAULT '{}',
  tuition_fees JSONB DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_universities_type ON universities(type);
CREATE INDEX IF NOT EXISTS idx_universities_is_active ON universities(is_active);
CREATE INDEX IF NOT EXISTS idx_universities_rating ON universities(rating);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
DROP TRIGGER IF EXISTS update_universities_updated_at ON universities;
CREATE TRIGGER update_universities_updated_at
    BEFORE UPDATE ON universities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- إدراج بيانات تجريبية
INSERT INTO universities (name, type, address, phone, email, website, description, established_year, accreditation, faculties, programs, admission_requirements, tuition_fees, rating, is_active) VALUES
('جامعة القاهرة', 'public', 'الجامعة، الجيزة، مصر', '+20 2 3567 0000', 'info@cu.edu.eg', 'https://cu.edu.eg', 'أقدم وأكبر الجامعات المصرية', 1908, 'وزارة التعليم العالي والبحث العلمي', 
 ARRAY['الطب', 'الهندسة', 'التجارة', 'الآداب', 'العلوم', 'الحقوق', 'الزراعة', 'الطب البيطري', 'التمريض', 'العلاج الطبيعي'],
 ARRAY['بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم'],
 ARRAY['شهادة الثانوية العامة', 'اختبار القبول', 'شهادة اللغة الإنجليزية'],
 '{"undergraduate": 5000, "graduate": 8000}'::jsonb,
 4.5, true),

('الجامعة الأمريكية بالقاهرة', 'international', 'الطريق الدائري، القاهرة الجديدة، مصر', '+20 2 2615 1000', 'admissions@aucegypt.edu', 'https://www.aucegypt.edu', 'جامعة أمريكية رائدة في مصر', 1919, 'الاعتماد الأمريكي',
 ARRAY['إدارة الأعمال', 'الهندسة', 'العلوم والآداب', 'الدراسات العليا', 'التعليم المستمر'],
 ARRAY['بكالوريوس', 'ماجستير', 'دكتوراه', 'شهادات مهنية'],
 ARRAY['شهادة الثانوية العامة', 'اختبار SAT أو ACT', 'شهادة TOEFL أو IELTS', 'مقابلة شخصية'],
 '{"undergraduate": 150000, "graduate": 200000}'::jsonb,
 4.8, true),

('جامعة عين شمس', 'public', 'عباسية، القاهرة، مصر', '+20 2 2414 0000', 'info@asu.edu.eg', 'https://www.asu.edu.eg', 'إحدى أعرق الجامعات المصرية', 1950, 'وزارة التعليم العالي والبحث العلمي',
 ARRAY['الطب', 'الهندسة', 'التجارة', 'الآداب', 'العلوم', 'الحقوق', 'التربية', 'الزراعة', 'التمريض'],
 ARRAY['بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم'],
 ARRAY['شهادة الثانوية العامة', 'اختبار القبول'],
 '{"undergraduate": 4000, "graduate": 7000}'::jsonb,
 4.3, true),

('الجامعة الألمانية بالقاهرة', 'international', 'الطريق الدائري، القاهرة الجديدة، مصر', '+20 2 2759 0000', 'info@guc.edu.eg', 'https://www.guc.edu.eg', 'جامعة ألمانية في مصر', 2003, 'الاعتماد الألماني',
 ARRAY['الهندسة', 'إدارة الأعمال', 'الصيدلة', 'العلوم التطبيقية', 'الدراسات العليا'],
 ARRAY['بكالوريوس', 'ماجستير', 'دكتوراه'],
 ARRAY['شهادة الثانوية العامة', 'اختبار القبول', 'شهادة اللغة الألمانية أو الإنجليزية'],
 '{"undergraduate": 120000, "graduate": 180000}'::jsonb,
 4.6, true),

('جامعة النيل', 'private', 'الطريق الدائري، القاهرة الجديدة، مصر', '+20 2 2759 0000', 'info@nileuniversity.edu.eg', 'https://www.nileuniversity.edu.eg', 'جامعة خاصة رائدة في التكنولوجيا', 2006, 'وزارة التعليم العالي والبحث العلمي',
 ARRAY['الهندسة', 'إدارة الأعمال', 'الصيدلة', 'العلوم التطبيقية', 'الدراسات العليا'],
 ARRAY['بكالوريوس', 'ماجستير', 'دكتوراه'],
 ARRAY['شهادة الثانوية العامة', 'اختبار القبول', 'مقابلة شخصية'],
 '{"undergraduate": 80000, "graduate": 120000}'::jsonb,
 4.4, true);

-- تعليق على الجدول
COMMENT ON TABLE universities IS 'جدول الجامعات والمعاهد العليا';
COMMENT ON COLUMN universities.type IS 'نوع الجامعة: public (حكومية), private (خاصة), international (دولية), technical (تقنية), other (أخرى)';
COMMENT ON COLUMN universities.faculties IS 'قائمة الكليات المتاحة';
COMMENT ON COLUMN universities.programs IS 'البرامج التعليمية المتاحة';
COMMENT ON COLUMN universities.admission_requirements IS 'متطلبات القبول';
COMMENT ON COLUMN universities.tuition_fees IS 'الرسوم الدراسية (JSON)';
COMMENT ON COLUMN universities.rating IS 'تقييم الجامعة من 0 إلى 5';
