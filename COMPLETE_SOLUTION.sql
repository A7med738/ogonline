-- حل شامل ودقيق لنظام احجزلي
-- يبدأ من الصفر ويضمن إنشاء جميع الجداول والأعمدة

-- 1. حذف الجداول الموجودة أولاً (إذا كانت موجودة)
DROP TABLE IF EXISTS book_service_appointments CASCADE;
DROP TABLE IF EXISTS book_service_clinics CASCADE;
DROP TABLE IF EXISTS book_service_health_centers CASCADE;

-- 2. إنشاء جدول مراكز الخدمات الصحية (احجزلي)
CREATE TABLE book_service_health_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  working_hours TEXT,
  description TEXT,
  image_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating NUMERIC DEFAULT 0,
  services TEXT[] DEFAULT '{}'
);

-- 3. إنشاء جدول عيادات الخدمات الصحية (احجزلي)
CREATE TABLE book_service_clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  health_center_id UUID REFERENCES book_service_health_centers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  consultation_fee DECIMAL(10, 2) NOT NULL,
  waiting_patients INTEGER DEFAULT 0,
  max_patients_per_day INTEGER DEFAULT 20,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء جدول حجوزات الخدمات الصحية (احجزلي)
CREATE TABLE book_service_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES book_service_clinics(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  appointment_time TIME NOT NULL DEFAULT '09:00',
  patient_name VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  patient_age INTEGER,
  patient_gender VARCHAR(10),
  medical_history TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  notes TEXT,
  queue_number INTEGER, -- رقم الطابور اليومي
  queue_position INTEGER DEFAULT 0, -- موضع المريض في الطابور
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. إدراج بيانات تجريبية للمراكز الصحية
INSERT INTO book_service_health_centers (
  id, name, address, phone, email, working_hours, description, 
  image_url, latitude, longitude, google_maps_url, rating, services
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'مركز الصحة الشامل',
  'شارع الملك فهد، حي النخيل، الرياض 12345',
  '+966501234567',
  'info@healthcenter.com',
  'السبت - الخميس: 8:00 ص - 10:00 م',
  'مركز طبي متكامل يقدم خدمات صحية شاملة مع أحدث التقنيات الطبية',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
  24.7136,
  46.6753,
  'https://maps.google.com/?q=24.7136,46.6753',
  4.8,
  ARRAY['طب عام', 'أطفال', 'نساء وولادة', 'أسنان', 'عيون', 'أنف وأذن وحنجرة', 'جلدية', 'عظام', 'قلب', 'أعصاب']
);

-- 6. إدراج بيانات تجريبية للعيادات
INSERT INTO book_service_clinics (
  id, health_center_id, name, doctor_name, specialization, 
  consultation_fee, waiting_patients, max_patients_per_day
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'عيادة الطب العام', 'د. أحمد محمد', 'طب عام', 150.00, 3, 25),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'عيادة الأطفال', 'د. فاطمة علي', 'أطفال', 200.00, 5, 20),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'عيادة النساء والولادة', 'د. مريم حسن', 'نساء وولادة', 300.00, 2, 15),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'عيادة الأسنان', 'د. خالد عبدالله', 'أسنان', 250.00, 4, 30),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'عيادة العيون', 'د. نورا سعد', 'عيون', 180.00, 1, 20),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'عيادة الأنف والأذن', 'د. عمر يوسف', 'أنف وأذن وحنجرة', 220.00, 3, 25),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'عيادة الجلدية', 'د. لينا محمود', 'جلدية', 200.00, 2, 20),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'عيادة العظام', 'د. سعد الدين', 'عظام', 280.00, 4, 18),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'عيادة القلب', 'د. هدى أحمد', 'قلب', 350.00, 1, 15),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'عيادة الأعصاب', 'د. يوسف محمد', 'أعصاب', 320.00, 2, 12),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'عيادة الباطنة', 'د. ريم عبدالرحمن', 'باطنة', 240.00, 3, 22);

-- 7. إنشاء سياسات الأمان (RLS)
ALTER TABLE book_service_health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_appointments ENABLE ROW LEVEL SECURITY;

-- 8. حذف السياسات الموجودة أولاً (إذا كانت موجودة)
DROP POLICY IF EXISTS "المراكز الصحية مرئية للجميع" ON book_service_health_centers;
DROP POLICY IF EXISTS "المراكز الصحية قابلة للتحديث للمديرين" ON book_service_health_centers;
DROP POLICY IF EXISTS "العيادات مرئية للجميع" ON book_service_clinics;
DROP POLICY IF EXISTS "العيادات قابلة للتحديث للمديرين" ON book_service_clinics;
DROP POLICY IF EXISTS "الحجوزات مرئية للمستخدمين" ON book_service_appointments;
DROP POLICY IF EXISTS "المستخدمون يمكنهم إنشاء حجوزات" ON book_service_appointments;
DROP POLICY IF EXISTS "المستخدمون يمكنهم تحديث حجوزاتهم" ON book_service_appointments;

-- 9. إنشاء سياسات الأمان للمراكز الصحية
CREATE POLICY "المراكز الصحية مرئية للجميع" ON book_service_health_centers
  FOR SELECT USING (true);

CREATE POLICY "المراكز الصحية قابلة للتحديث للمديرين" ON book_service_health_centers
  FOR UPDATE USING (auth.role() = 'service_role');

-- 10. إنشاء سياسات الأمان للعيادات
CREATE POLICY "العيادات مرئية للجميع" ON book_service_clinics
  FOR SELECT USING (true);

CREATE POLICY "العيادات قابلة للتحديث للمديرين" ON book_service_clinics
  FOR UPDATE USING (auth.role() = 'service_role');

-- 11. إنشاء سياسات الأمان للحجوزات
CREATE POLICY "الحجوزات مرئية للمستخدمين" ON book_service_appointments
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "المستخدمون يمكنهم إنشاء حجوزات" ON book_service_appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم تحديث حجوزاتهم" ON book_service_appointments
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- 12. إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_book_service_appointments_clinic_id ON book_service_appointments(clinic_id);
CREATE INDEX idx_book_service_appointments_user_id ON book_service_appointments(user_id);
CREATE INDEX idx_book_service_appointments_date ON book_service_appointments(appointment_date);
CREATE INDEX idx_book_service_appointments_status ON book_service_appointments(status);
CREATE INDEX idx_book_service_appointments_queue_number ON book_service_appointments(queue_number);

CREATE INDEX idx_book_service_clinics_health_center_id ON book_service_clinics(health_center_id);
CREATE INDEX idx_book_service_clinics_specialization ON book_service_clinics(specialization);

-- 13. التحقق من إنشاء الجداول
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('book_service_health_centers', 'book_service_clinics', 'book_service_appointments')
ORDER BY table_name, ordinal_position;

-- تم إنشاء النظام بنجاح! ✅
