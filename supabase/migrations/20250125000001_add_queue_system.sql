-- إضافة نظام طابور المرضى لكل دكتور
-- تاريخ الإنشاء: 2025-01-25
-- الوصف: إضافة نظام طابور المرضى مع حساب رقم الحجز والانتظار

-- إضافة عمود رقم الطابور للمواعيد
ALTER TABLE book_service_appointments 
ADD COLUMN IF NOT EXISTS queue_number INTEGER,
ADD COLUMN IF NOT EXISTS queue_position INTEGER DEFAULT 0; -- موضع المريض في الطابور

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

-- إنشاء دالة لتحديث طابور العيادة عند إلغاء موعد
CREATE OR REPLACE FUNCTION update_clinic_queue_on_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث إحصائيات الطابور عند الإلغاء
  UPDATE book_service_clinic_queues 
  SET 
    total_patients_today = GREATEST(total_patients_today - 1, 0),
    last_updated = NOW()
  WHERE clinic_id = OLD.clinic_id;
  
  -- إعادة حساب مواضع المرضى المتبقين
  UPDATE book_service_appointments 
  SET 
    queue_position = calculate_queue_position(clinic_id, id),
    estimated_wait_time = calculate_wait_time(clinic_id, id)
  WHERE clinic_id = OLD.clinic_id 
    AND appointment_date = OLD.appointment_date
    AND status IN ('pending', 'confirmed')
    AND id != OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث الطابور عند إلغاء موعد
DROP TRIGGER IF EXISTS trigger_update_clinic_queue_cancellation ON book_service_appointments;
CREATE TRIGGER trigger_update_clinic_queue_cancellation
  AFTER UPDATE ON book_service_appointments
  FOR EACH ROW
  WHEN (OLD.status != 'cancelled' AND NEW.status = 'cancelled')
  EXECUTE FUNCTION update_clinic_queue_on_cancellation();

-- تفعيل سياسات الأمان للجداول الجديدة
ALTER TABLE book_service_clinic_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_service_queue_status ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لطابور العيادات
DROP POLICY IF EXISTS "طابور العيادات مرئي للجميع" ON book_service_clinic_queues;
CREATE POLICY "طابور العيادات مرئي للجميع" ON book_service_clinic_queues
  FOR SELECT USING (true);

-- سياسات الأمان لحالة الطابور
DROP POLICY IF EXISTS "حالة الطابور مرئية للجميع" ON book_service_queue_status;
CREATE POLICY "حالة الطابور مرئية للجميع" ON book_service_queue_status
  FOR SELECT USING (true);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_queue ON book_service_appointments(clinic_id, appointment_date, queue_number);
CREATE INDEX IF NOT EXISTS idx_book_service_appointments_status_date ON book_service_appointments(status, appointment_date);
CREATE INDEX IF NOT EXISTS idx_book_service_clinic_queues_clinic ON book_service_clinic_queues(clinic_id);
CREATE INDEX IF NOT EXISTS idx_book_service_queue_status_clinic ON book_service_queue_status(clinic_id);

-- تفعيل Realtime للجداول الجديدة
ALTER PUBLICATION supabase_realtime ADD TABLE book_service_clinic_queues;
ALTER PUBLICATION supabase_realtime ADD TABLE book_service_queue_status;
