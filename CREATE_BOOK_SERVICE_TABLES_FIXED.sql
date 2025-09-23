-- إنشاء جداول نظام احجزلي - نظام حجز الخدمات الصحية
-- هذا النظام منفصل تماماً عن الخدمات الصحية الموجودة في التطبيق

-- 1. إنشاء جدول مراكز الخدمات الصحية (احجزلي)
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

-- 2. إنشاء جدول عيادات الخدمات الصحية (احجزلي)
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

-- 3. إنشاء جدول حجوزات الخدمات الصحية (احجزلي)
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

-- 4. إنشاء جدول لإدارة طابور كل عيادة
CREATE TABLE IF NOT EXISTS book_service_clinic_queues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES book_service_clinics(id) ON DELETE CASCADE,
  current_queue_number INTEGER DEFAULT 0,
  total_patients_today INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. إنشاء جدول لتتبع حالة الطابور
CREATE TABLE IF NOT EXISTS book_service_queue_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES book_service_clinics(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- active, paused, closed
  current_serving_queue_number INTEGER DEFAULT 0,
  next_queue_number INTEGER DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. إنشاء دالة لحساب رقم الطابور التالي
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

-- 7. إنشاء دالة لحساب موضع المريض في الطابور
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

-- 8. إنشاء دالة لتحديث طابور العيادة عند إضافة موعد جديد
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

-- 9. إنشاء trigger لتحديث الطابور تلقائياً
DROP TRIGGER IF EXISTS trigger_update_clinic_queue ON book_service_appointments;
CREATE TRIGGER trigger_update_clinic_queue
  BEFORE INSERT ON book_service_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_clinic_queue_on_appointment();

-- 10. حذف البيانات الموجودة أولاً (إذا كانت موجودة)
DELETE FROM book_service_queue_status WHERE clinic_id IN (SELECT id FROM book_service_clinics);
DELETE FROM book_service_clinic_queues WHERE clinic_id IN (SELECT id FROM book_service_clinics);
DELETE FROM book_service_appointments WHERE clinic_id IN (SELECT id FROM book_service_clinics);
DELETE FROM book_service_clinics WHERE health_center_id IN (SELECT id FROM book_service_health_centers);
DELETE FROM book_service_health_centers WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 11. إدراج بيانات تجريبية للمراكز الصحية
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

-- 12. إدراج بيانات تجريبية للعيادات
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

-- 13. إدراج بيانات الطابور للعيادات
INSERT INTO book_service_clinic_queues (clinic_id, current_queue_number, total_patients_today)
VALUES 
('550e8400-e29b-41d4-a716-446655440001', 0, 3),
('550e8400-e29b-41d4-a716-446655440002', 0, 5),
('550e8400-e29b-41d4-a716-446655440003', 0, 2),
('550e8400-e29b-41d4-a716-446655440004', 0, 4),
('550e8400-e29b-41d4-a716-446655440005', 0, 1),
('550e8400-e29b-41d4-a716-446655440006', 0, 3),
('550e8400-e29b-41d4-a716-446655440007', 0, 2),
('550e8400-e29b-41d4-a716-446655440008', 0, 4),
('550e8400-e29b-41d4-a716-446655440009', 0, 1),
('550e8400-e29b-41d4-a716-446655440010', 0, 2),
('550e8400-e29b-41d4-a716-446655440011', 0, 3);

-- 14. إدراج حالة الطابور للعيادات
INSERT INTO book_service_queue_status (clinic_id, current_serving_queue_number, next_queue_number)
VALUES 
('550e8400-e29b-41d4-a716-446655440001', 0, 1),
('550e8400-e29b-41d4-a716-446655440002', 0, 1),
('550e8400-e29b-41d4-a716-446655440003', 0, 1),
('550e8400-e29b-41d4-a716-446655440004', 0, 1),
('550e8400-e29b-41d4-a716-446655440005', 0, 1),
('550e8400-e29b-41d4-a716-446655440006', 0, 1),
('550e8400-e29b-41d4-a716-446655440007', 0, 1),
('550e8400-e29b-41d4-a716-446655440008', 0, 1),
('550e8400-e29b-41d4-a716-446655440009', 0, 1),
('550e8400-e29b-41d4-a716-446655440010', 0, 1),
('550e8400-e29b-41d4-a716-446655440011', 0, 1);

-- 15. إنشاء سياسات الأمان (RLS)
ALTER TABLE book_service_health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_clinic_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_queue_status ENABLE ROW LEVEL SECURITY;

-- 16. سياسات الأمان للمراكز الصحية
CREATE POLICY "المراكز الصحية مرئية للجميع" ON book_service_health_centers
  FOR SELECT USING (true);

CREATE POLICY "المراكز الصحية قابلة للتحديث للمديرين" ON book_service_health_centers
  FOR UPDATE USING (auth.role() = 'service_role');

-- 17. سياسات الأمان للعيادات
CREATE POLICY "العيادات مرئية للجميع" ON book_service_clinics
  FOR SELECT USING (true);

CREATE POLICY "العيادات قابلة للتحديث للمديرين" ON book_service_clinics
  FOR UPDATE USING (auth.role() = 'service_role');

-- 18. سياسات الأمان للحجوزات
CREATE POLICY "الحجوزات مرئية للمستخدمين" ON book_service_appointments
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "المستخدمون يمكنهم إنشاء حجوزات" ON book_service_appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم تحديث حجوزاتهم" ON book_service_appointments
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- 19. سياسات الأمان لطوابير العيادات
CREATE POLICY "طوابير العيادات مرئية للجميع" ON book_service_clinic_queues
  FOR SELECT USING (true);

CREATE POLICY "طوابير العيادات قابلة للتحديث للمديرين" ON book_service_clinic_queues
  FOR UPDATE USING (auth.role() = 'service_role');

-- 20. سياسات الأمان لحالة الطابور
CREATE POLICY "حالة الطابور مرئية للجميع" ON book_service_queue_status
  FOR SELECT USING (true);

CREATE POLICY "حالة الطابور قابلة للتحديث للمديرين" ON book_service_queue_status
  FOR UPDATE USING (auth.role() = 'service_role');

-- 21. إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_clinic_id ON book_service_appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_user_id ON book_service_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_date ON book_service_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_status ON book_service_appointments(status);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_queue_number ON book_service_appointments(queue_number);

CREATE INDEX IF NOT EXISTS idx_book_service_clinics_health_center_id ON book_service_clinics(health_center_id);
CREATE INDEX IF NOT EXISTS idx_book_service_clinics_specialization ON book_service_clinics(specialization);

-- تم إنشاء جميع الجداول والوظائف بنجاح! ✅
