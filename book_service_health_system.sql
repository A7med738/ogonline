-- نظام حجز الخدمات الصحية - احجزلي
-- هذا النظام منفصل تماماً عن الخدمات الصحية الموجودة في التطبيق
-- يستخدم أسماء جداول مختلفة لتجنب التداخل

-- إنشاء جدول مراكز الخدمات الصحية (احجزلي)
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

-- إنشاء جدول عيادات الخدمات الصحية (احجزلي)
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

-- إنشاء جدول حجوزات الخدمات الصحية (احجزلي)
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
  queue_number INTEGER, -- رقم الطابور
  queue_position INTEGER DEFAULT 0, -- موضع المريض في الطابور
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول لإدارة طابور كل عيادة
CREATE TABLE IF NOT EXISTS book_service_clinic_queues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES book_service_clinics(id) ON DELETE CASCADE,
  current_queue_number INTEGER DEFAULT 0,
  total_patients_today INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول لتتبع حالة الطابور
CREATE TABLE IF NOT EXISTS book_service_queue_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES book_service_clinics(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- active, paused, closed
  current_serving_queue_number INTEGER DEFAULT 0,
  next_queue_number INTEGER DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء دالة لحساب رقم الطابور التالي
CREATE OR REPLACE FUNCTION get_next_queue_number(clinic_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  -- الحصول على رقم الطابور التالي
  SELECT COALESCE(MAX(queue_number), 0) + 1 
  INTO next_num
  FROM book_service_appointments 
  WHERE clinic_id = clinic_uuid 
    AND appointment_date = CURRENT_DATE
    AND status IN ('pending', 'confirmed');
  
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة لحساب موضع المريض في الطابور
CREATE OR REPLACE FUNCTION calculate_queue_position(clinic_uuid UUID, appointment_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  position INTEGER;
BEGIN
  -- حساب عدد المرضى المنتظرين قبل هذا المريض
  SELECT COUNT(*) + 1
  INTO position
  FROM book_service_appointments 
  WHERE clinic_id = clinic_uuid 
    AND appointment_date = CURRENT_DATE
    AND status IN ('pending', 'confirmed')
    AND queue_number < (
      SELECT queue_number 
      FROM book_service_appointments 
      WHERE id = appointment_uuid
    );
  
  RETURN position;
END;
$$ LANGUAGE plpgsql;


-- إنشاء دالة لتحديث طابور العيادة عند إضافة موعد جديد
CREATE OR REPLACE FUNCTION update_clinic_queue_on_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث رقم الطابور للموعد الجديد
  NEW.queue_number := get_next_queue_number(NEW.clinic_id);
  
  -- حساب موضع المريض في الطابور
  NEW.queue_position := calculate_queue_position(NEW.clinic_id, NEW.id);
  
  -- تحديث إحصائيات الطابور
  UPDATE book_service_clinic_queues 
  SET 
    total_patients_today = total_patients_today + 1,
    last_updated = NOW()
  WHERE clinic_id = NEW.clinic_id;
  
  -- تحديث حالة الطابور
  UPDATE book_service_queue_status 
  SET 
    next_queue_number = NEW.queue_number + 1,
    last_updated = NOW()
  WHERE clinic_id = NEW.clinic_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث الطابور تلقائياً عند إضافة موعد جديد
DROP TRIGGER IF EXISTS trigger_update_clinic_queue ON book_service_appointments;
CREATE TRIGGER trigger_update_clinic_queue
  BEFORE INSERT ON book_service_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_clinic_queue_on_appointment();

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_book_service_health_centers_active ON book_service_health_centers(is_active);
CREATE INDEX IF NOT EXISTS idx_book_service_clinics_health_center ON book_service_clinics(health_center_id);
CREATE INDEX IF NOT EXISTS idx_book_service_clinics_available ON book_service_clinics(is_available);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_user ON book_service_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_clinic ON book_service_appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_date ON book_service_appointments(appointment_date);

-- إضافة الأعمدة المفقودة إذا لم تكن موجودة
ALTER TABLE book_service_health_centers 
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}';

-- حذف البيانات الموجودة مسبقاً (إذا كانت موجودة)
DELETE FROM book_service_appointments WHERE clinic_id IN (
  SELECT id FROM book_service_clinics WHERE health_center_id = '550e8400-e29b-41d4-a716-446655440000'
);
DELETE FROM book_service_clinics WHERE health_center_id = '550e8400-e29b-41d4-a716-446655440000';
DELETE FROM book_service_health_centers WHERE id = '550e8400-e29b-41d4-a716-446655440000';

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

-- إدراج بيانات الطابور للعيادات الموجودة
INSERT INTO book_service_clinic_queues (clinic_id, current_queue_number, total_patients_today)
SELECT 
  id,
  0,
  waiting_patients
FROM book_service_clinics;

-- إدراج حالة الطابور للعيادات
INSERT INTO book_service_queue_status (clinic_id, current_serving_queue_number, next_queue_number)
SELECT 
  id,
  0,
  1
FROM book_service_clinics;

-- تفعيل سياسات الأمان
ALTER TABLE book_service_health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_clinic_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_queue_status ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لمراكز الخدمات الصحية
DROP POLICY IF EXISTS "مراكز احجزلي مرئية للجميع" ON book_service_health_centers;
CREATE POLICY "مراكز احجزلي مرئية للجميع" ON book_service_health_centers
  FOR SELECT USING (is_active = true);

-- سياسات الأمان لعيادات الخدمات الصحية
DROP POLICY IF EXISTS "عيادات احجزلي مرئية للجميع" ON book_service_clinics;
CREATE POLICY "عيادات احجزلي مرئية للجميع" ON book_service_clinics
  FOR SELECT USING (is_available = true);

-- سياسات الأمان لحجوزات الخدمات الصحية
DROP POLICY IF EXISTS "المستخدمون يمكنهم رؤية حجوزات احجزلي" ON book_service_appointments;
CREATE POLICY "المستخدمون يمكنهم رؤية حجوزات احجزلي" ON book_service_appointments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "المستخدمون يمكنهم إنشاء حجوزات احجزلي جديدة" ON book_service_appointments;
CREATE POLICY "المستخدمون يمكنهم إنشاء حجوزات احجزلي جديدة" ON book_service_appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "المستخدمون يمكنهم تحديث حجوزات احجزلي" ON book_service_appointments;
CREATE POLICY "المستخدمون يمكنهم تحديث حجوزات احجزلي" ON book_service_appointments
  FOR UPDATE USING (auth.uid() = user_id);

-- سياسات الأمان لطابور العيادات
DROP POLICY IF EXISTS "طابور العيادات مرئي للجميع" ON book_service_clinic_queues;
CREATE POLICY "طابور العيادات مرئي للجميع" ON book_service_clinic_queues
  FOR SELECT USING (true);

-- سياسات الأمان لحالة الطابور
DROP POLICY IF EXISTS "حالة الطابور مرئية للجميع" ON book_service_queue_status;
CREATE POLICY "حالة الطابور مرئية للجميع" ON book_service_queue_status
  FOR SELECT USING (true);

-- دالة لتحديث وقت التحديث
CREATE OR REPLACE FUNCTION update_book_service_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة triggers لتحديث الوقت
DROP TRIGGER IF EXISTS update_book_service_health_centers_updated_at ON book_service_health_centers;
CREATE TRIGGER update_book_service_health_centers_updated_at BEFORE UPDATE ON book_service_health_centers
    FOR EACH ROW EXECUTE FUNCTION update_book_service_updated_at_column();

DROP TRIGGER IF EXISTS update_book_service_clinics_updated_at ON book_service_clinics;
CREATE TRIGGER update_book_service_clinics_updated_at BEFORE UPDATE ON book_service_clinics
    FOR EACH ROW EXECUTE FUNCTION update_book_service_updated_at_column();

DROP TRIGGER IF EXISTS update_book_service_appointments_updated_at ON book_service_appointments;
CREATE TRIGGER update_book_service_appointments_updated_at BEFORE UPDATE ON book_service_appointments
    FOR EACH ROW EXECUTE FUNCTION update_book_service_updated_at_column();
