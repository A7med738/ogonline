-- إنشاء نظام احجزلي الطبي
-- تاريخ الإنشاء: 2025-01-25
-- الوصف: إنشاء جداول نظام احجزلي الطبي منفصلة عن النظام الطبي الموجود

-- إنشاء جدول مراكز الخدمات الصحية لنظام احجزلي
CREATE TABLE IF NOT EXISTS book_service_health_centers (
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

-- إنشاء جدول العيادات لنظام احجزلي
CREATE TABLE IF NOT EXISTS book_service_clinics (
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

-- إنشاء جدول المواعيد لنظام احجزلي
CREATE TABLE IF NOT EXISTS book_service_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES book_service_clinics(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  patient_age INTEGER,
  patient_gender VARCHAR(10),
  medical_history TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج المركز الصحي الافتراضي لنظام احجزلي
INSERT INTO book_service_health_centers (
  id,
  name,
  address,
  phone,
  email,
  working_hours,
  description,
  image_url,
  latitude,
  longitude,
  google_maps_url,
  is_active,
  rating,
  services
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'مركز حدائق أكتوبر الطبي المتكامل - احجزلي',
  'حدائق أكتوبر، شارع النيل، بجوار مول الأندلس، الحي السابع، الجيزة',
  '01234567890',
  'info@octobergardens-medical.com',
  '24/7 - خدمة طوارئ متاحة',
  'مركز طبي متكامل يقدم خدمات طبية شاملة لسكان حدائق أكتوبر مع أحدث التقنيات الطبية - خدمة احجزلي',
  '/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png',
  30.0444,
  31.2357,
  'https://maps.google.com/?q=30.0444,31.2357',
  true,
  4.8,
  ARRAY['طب عام', 'أطفال', 'نساء وتوليد', 'قلب', 'عظام', 'جلدية', 'أنف وأذن وحنجرة', 'عيون', 'أسنان']
);

-- إدراج العيادات لنظام احجزلي
INSERT INTO book_service_clinics (
  health_center_id,
  name,
  doctor_name,
  specialization,
  consultation_fee,
  waiting_patients,
  max_patients_per_day,
  is_available
) VALUES 
-- عيادة الطب العام
('550e8400-e29b-41d4-a716-446655440000', 'عيادة الطب العام - احجزلي', 'د. أحمد محمد علي', 'طب عام', 150.00, 3, 25, true),
('550e8400-e29b-41d4-a716-446655440000', 'عيادة الطب العام - احجزلي', 'د. فاطمة حسن محمود', 'طب عام', 150.00, 1, 20, true),

-- عيادة الأطفال
('550e8400-e29b-41d4-a716-446655440000', 'عيادة الأطفال - احجزلي', 'د. محمد عبد الرحمن', 'طب أطفال', 200.00, 5, 15, true),
('550e8400-e29b-41d4-a716-446655440000', 'عيادة الأطفال - احجزلي', 'د. نورا سعد الدين', 'طب أطفال', 200.00, 2, 18, true),

-- عيادة النساء والتوليد
('550e8400-e29b-41d4-a716-446655440000', 'عيادة النساء والتوليد - احجزلي', 'د. منى أحمد فؤاد', 'نساء وتوليد', 250.00, 4, 12, true),

-- عيادة القلب
('550e8400-e29b-41d4-a716-446655440000', 'عيادة القلب - احجزلي', 'د. خالد محمود إبراهيم', 'أمراض القلب', 300.00, 2, 10, true),

-- عيادة العظام
('550e8400-e29b-41d4-a716-446655440000', 'عيادة العظام - احجزلي', 'د. يوسف علي حسن', 'جراحة العظام', 280.00, 6, 15, true),

-- عيادة الجلدية
('550e8400-e29b-41d4-a716-446655440000', 'عيادة الجلدية - احجزلي', 'د. سارة محمد عبد الله', 'أمراض جلدية', 180.00, 1, 20, true),

-- عيادة الأنف والأذن والحنجرة
('550e8400-e29b-41d4-a716-446655440000', 'عيادة الأنف والأذن والحنجرة - احجزلي', 'د. عمر أحمد محمد', 'أنف وأذن وحنجرة', 220.00, 3, 15, true),

-- عيادة العيون
('550e8400-e29b-41d4-a716-446655440000', 'عيادة العيون - احجزلي', 'د. ليلى محمود حسن', 'طب العيون', 200.00, 2, 18, true),

-- عيادة الأسنان
('550e8400-e29b-41d4-a716-446655440000', 'عيادة الأسنان - احجزلي', 'د. أحمد سعد الدين', 'طب الأسنان', 120.00, 4, 25, true);

-- تفعيل سياسات الأمان
ALTER TABLE book_service_health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_appointments ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لمراكز الخدمات الصحية
DROP POLICY IF EXISTS "مراكز احجزلي مرئية للجميع" ON book_service_health_centers;
CREATE POLICY "مراكز احجزلي مرئية للجميع" ON book_service_health_centers
  FOR SELECT USING (is_active = true);

-- سياسات الأمان للعيادات
DROP POLICY IF EXISTS "عيادات احجزلي مرئية للجميع" ON book_service_clinics;
CREATE POLICY "عيادات احجزلي مرئية للجميع" ON book_service_clinics
  FOR SELECT USING (true);

-- سياسات الأمان للمواعيد
DROP POLICY IF EXISTS "مواعيد احجزلي للمستخدمين المسجلين" ON book_service_appointments;
CREATE POLICY "مواعيد احجزلي للمستخدمين المسجلين" ON book_service_appointments
  FOR ALL USING (auth.uid() = user_id);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_book_service_health_centers_active ON book_service_health_centers(is_active);
CREATE INDEX IF NOT EXISTS idx_book_service_clinics_health_center ON book_service_clinics(health_center_id);
CREATE INDEX IF NOT EXISTS idx_book_service_clinics_available ON book_service_clinics(is_available);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_user ON book_service_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_clinic ON book_service_appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_status ON book_service_appointments(status);

-- تفعيل Realtime للمواعيد
ALTER PUBLICATION supabase_realtime ADD TABLE book_service_appointments;
