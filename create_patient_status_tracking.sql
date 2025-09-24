-- إنشاء جدول تتبع حالة المرضى
CREATE TABLE IF NOT EXISTS patient_status_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES book_service_appointments(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL, -- pending, confirmed, in_progress, completed, cancelled
  previous_status VARCHAR(20), -- الحالة السابقة
  changed_by UUID REFERENCES auth.users(id), -- من قام بتغيير الحالة
  status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  waiting_time INTEGER, -- وقت الانتظار بالدقائق
  consultation_duration INTEGER, -- مدة الاستشارة بالدقائق
  notes TEXT, -- ملاحظات إضافية
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_patient_status_tracking_appointment_id ON patient_status_tracking(appointment_id);
CREATE INDEX IF NOT EXISTS idx_patient_status_tracking_status ON patient_status_tracking(status);
CREATE INDEX IF NOT EXISTS idx_patient_status_tracking_changed_at ON patient_status_tracking(status_changed_at);

-- إنشاء دالة لتحديث عدد المرضى المتبقين عند اكتمال حالة المريض
CREATE OR REPLACE FUNCTION update_patients_ahead_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  appointment_record RECORD;
  clinic_id_var UUID;
BEGIN
  -- التحقق من أن الحالة الجديدة هي "completed"
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- الحصول على بيانات الموعد
    SELECT clinic_id INTO clinic_id_var
    FROM book_service_appointments
    WHERE id = NEW.appointment_id;
    
    -- تحديث queue_position لجميع المرضى الذين يأتون بعد هذا المريض
    UPDATE book_service_appointments
    SET 
      queue_position = queue_position - 1,
      updated_at = NOW()
    WHERE clinic_id = clinic_id_var
      AND appointment_date = CURRENT_DATE
      AND status IN ('pending', 'confirmed', 'in_progress')
      AND queue_position > (
        SELECT queue_position 
        FROM book_service_appointments 
        WHERE id = NEW.appointment_id
      );
    
    -- تحديث إحصائيات الطابور
    UPDATE book_service_clinic_queues
    SET 
      total_patients_today = total_patients_today - 1,
      last_updated = NOW()
    WHERE clinic_id = clinic_id_var;
    
    -- تحديث عدد المرضى في العيادة
    UPDATE book_service_clinics
    SET 
      waiting_patients = waiting_patients - 1,
      updated_at = NOW()
    WHERE id = clinic_id_var;
    
    -- تحديث حالة الطابور
    UPDATE book_service_queue_status
    SET 
      current_serving_queue_number = (
        SELECT queue_position 
        FROM book_service_appointments 
        WHERE id = NEW.appointment_id
      ),
      last_updated = NOW()
    WHERE clinic_id = clinic_id_var;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتشغيل الدالة عند إدراج سجل جديد في patient_status_tracking
CREATE TRIGGER trigger_update_patients_ahead_on_completion
  AFTER INSERT ON patient_status_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_patients_ahead_on_completion();

-- إنشاء دالة لتحديث حالة الموعد في جدول book_service_appointments
CREATE OR REPLACE FUNCTION update_appointment_status_from_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث حالة الموعد في الجدول الرئيسي
  UPDATE book_service_appointments
  SET 
    status = NEW.status,
    updated_at = NOW()
  WHERE id = NEW.appointment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث حالة الموعد
CREATE TRIGGER trigger_update_appointment_status
  AFTER INSERT ON patient_status_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_status_from_tracking();

-- إنشاء دالة للحصول على عدد المرضى المتبقين أمام مريض معين
CREATE OR REPLACE FUNCTION get_patients_ahead_count(appointment_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  appointment_record RECORD;
  patients_ahead INTEGER;
BEGIN
  -- الحصول على بيانات الموعد
  SELECT clinic_id, queue_position, status
  INTO appointment_record
  FROM book_service_appointments
  WHERE id = appointment_uuid;
  
  -- إذا لم يتم العثور على الموعد أو تم إكماله
  IF NOT FOUND OR appointment_record.status = 'completed' THEN
    RETURN 0;
  END IF;
  
  -- حساب عدد المرضى المتبقين
  SELECT COUNT(*)
  INTO patients_ahead
  FROM book_service_appointments
  WHERE clinic_id = appointment_record.clinic_id
    AND appointment_date = CURRENT_DATE
    AND status IN ('pending', 'confirmed', 'in_progress')
    AND queue_position < appointment_record.queue_position;
  
  RETURN COALESCE(patients_ahead, 0);
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة للحصول على حالة الطابور الحالية
CREATE OR REPLACE FUNCTION get_current_queue_status(clinic_uuid UUID)
RETURNS TABLE (
  current_serving INTEGER,
  total_patients INTEGER,
  patients_ahead INTEGER,
  estimated_wait_time INTEGER
) AS $$
DECLARE
  serving_num INTEGER;
  total_count INTEGER;
  ahead_count INTEGER;
  wait_time INTEGER;
BEGIN
  -- الحصول على الرقم الحالي المقدم
  SELECT COALESCE(current_serving_queue_number, 0)
  INTO serving_num
  FROM book_service_queue_status
  WHERE clinic_id = clinic_uuid;
  
  -- الحصول على إجمالي المرضى
  SELECT COALESCE(total_patients_today, 0)
  INTO total_count
  FROM book_service_clinic_queues
  WHERE clinic_id = clinic_uuid;
  
  -- حساب المرضى المتبقين
  SELECT COUNT(*)
  INTO ahead_count
  FROM book_service_appointments
  WHERE clinic_id = clinic_uuid
    AND appointment_date = CURRENT_DATE
    AND status IN ('pending', 'confirmed', 'in_progress')
    AND queue_position > serving_num;
  
  -- تقدير وقت الانتظار (افتراض 15 دقيقة لكل مريض)
  wait_time := ahead_count * 15;
  
  RETURN QUERY SELECT serving_num, total_count, ahead_count, wait_time;
END;
$$ LANGUAGE plpgsql;

-- إدراج بيانات تجريبية للاختبار
INSERT INTO patient_status_tracking (appointment_id, status, previous_status, notes)
VALUES 
  ('1049058d-58ef-4359-943b-3b51fcefdbe0', 'in_progress', 'pending', 'تم استدعاء المريض التالي'),
  ('1049058d-58ef-4359-943b-3b51fcefdbe0', 'completed', 'confirmed', 'تم إكمال الاستشارة'),
  ('1049058d-58ef-4359-943b-3b51fcefdbe0', 'in_progress', 'pending', 'تم استدعاء المريض مرة أخرى'),
  ('1049058d-58ef-4359-943b-3b51fcefdbe0', 'confirmed', 'in_progress', 'تم تأكيد الموعد');

-- تمكين Row Level Security
ALTER TABLE patient_status_tracking ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
CREATE POLICY "Users can view their own patient status tracking" ON patient_status_tracking
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM book_service_appointments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own patient status tracking" ON patient_status_tracking
  FOR INSERT WITH CHECK (
    appointment_id IN (
      SELECT id FROM book_service_appointments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own patient status tracking" ON patient_status_tracking
  FOR UPDATE USING (
    appointment_id IN (
      SELECT id FROM book_service_appointments WHERE user_id = auth.uid()
    )
  );

-- سياسة للمديرين والأطباء
CREATE POLICY "Admins and doctors can manage all patient status tracking" ON patient_status_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM book_service_clinics 
      WHERE id = (
        SELECT clinic_id FROM book_service_appointments 
        WHERE id = appointment_id
      )
      AND EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' IN ('admin', 'doctor')
      )
    )
  );
