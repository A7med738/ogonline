-- إصلاح مشكلة أرقام الطابور المتكررة
-- هذا الملف يصلح المشكلة حيث كل المرضى يحصلون على رقم 1

-- 1. أولاً، دعنا نرى البيانات الحالية
SELECT 
    clinic_id,
    COUNT(*) as total_appointments,
    MIN(queue_number) as min_queue,
    MAX(queue_number) as max_queue,
    COUNT(DISTINCT queue_number) as unique_queue_numbers
FROM book_service_appointments 
WHERE appointment_date = CURRENT_DATE
GROUP BY clinic_id;

-- 2. إعادة ترقيم جميع المواعيد للتاريخ الحالي
WITH ranked_appointments AS (
    SELECT 
        id,
        clinic_id,
        ROW_NUMBER() OVER (PARTITION BY clinic_id ORDER BY created_at) as new_queue_number
    FROM book_service_appointments 
    WHERE appointment_date = CURRENT_DATE
        AND status IN ('pending', 'confirmed')
)
UPDATE book_service_appointments 
SET 
    queue_number = ra.new_queue_number,
    queue_position = ra.new_queue_number,
    updated_at = NOW()
FROM ranked_appointments ra
WHERE book_service_appointments.id = ra.id;

-- 3. تحديث جدول book_service_clinic_queues
UPDATE book_service_clinic_queues 
SET 
    current_queue_number = (
        SELECT COALESCE(MAX(queue_number), 0)
        FROM book_service_appointments 
        WHERE clinic_id = book_service_clinic_queues.clinic_id
            AND appointment_date = CURRENT_DATE
            AND status IN ('pending', 'confirmed')
    ),
    total_patients_today = (
        SELECT COUNT(*)
        FROM book_service_appointments 
        WHERE clinic_id = book_service_clinic_queues.clinic_id
            AND appointment_date = CURRENT_DATE
            AND status IN ('pending', 'confirmed')
    ),
    last_updated = NOW();

-- 4. تحديث جدول book_service_queue_status
UPDATE book_service_queue_status 
SET 
    next_queue_number = (
        SELECT COALESCE(MAX(queue_number), 0) + 1
        FROM book_service_appointments 
        WHERE clinic_id = book_service_queue_status.clinic_id
            AND appointment_date = CURRENT_DATE
            AND status IN ('pending', 'confirmed')
    ),
    last_updated = NOW();

-- 5. تحديث عدد المرضى في العيادات
UPDATE book_service_clinics 
SET 
    waiting_patients = (
        SELECT COUNT(*)
        FROM book_service_appointments 
        WHERE clinic_id = book_service_clinics.id
            AND appointment_date = CURRENT_DATE
            AND status IN ('pending', 'confirmed')
    ),
    updated_at = NOW();

-- 6. التحقق من النتائج
SELECT 
    'After Fix' as status,
    clinic_id,
    COUNT(*) as total_appointments,
    MIN(queue_number) as min_queue,
    MAX(queue_number) as max_queue,
    COUNT(DISTINCT queue_number) as unique_queue_numbers
FROM book_service_appointments 
WHERE appointment_date = CURRENT_DATE
GROUP BY clinic_id;

-- 7. إنشاء trigger محسن لتجنب المشكلة في المستقبل
CREATE OR REPLACE FUNCTION get_next_queue_number_safe(clinic_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  -- استخدام LOCK لتجنب التضارب
  LOCK TABLE book_service_appointments IN SHARE ROW EXCLUSIVE MODE;
  
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

-- 8. تحديث الـ trigger ليستخدم الدالة المحسنة
CREATE OR REPLACE FUNCTION update_clinic_queue_on_appointment_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث رقم الطابور للموعد الجديد
  NEW.queue_number := get_next_queue_number_safe(NEW.clinic_id);
  
  -- حساب موضع المريض في الطابور
  NEW.queue_position := NEW.queue_number;
  
  -- تحديث إحصائيات الطابور
  INSERT INTO book_service_clinic_queues (clinic_id, current_queue_number, total_patients_today, last_updated)
  VALUES (NEW.clinic_id, NEW.queue_number, 1, NOW())
  ON CONFLICT (clinic_id) 
  DO UPDATE SET 
    current_queue_number = NEW.queue_number,
    total_patients_today = book_service_clinic_queues.total_patients_today + 1,
    last_updated = NOW();
  
  -- تحديث حالة الطابور
  INSERT INTO book_service_queue_status (clinic_id, status, current_serving_queue_number, next_queue_number, last_updated)
  VALUES (NEW.clinic_id, 'active', 0, NEW.queue_number + 1, NOW())
  ON CONFLICT (clinic_id) 
  DO UPDATE SET 
    next_queue_number = NEW.queue_number + 1,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. إعادة إنشاء الـ trigger
DROP TRIGGER IF EXISTS trigger_update_clinic_queue ON book_service_appointments;
CREATE TRIGGER trigger_update_clinic_queue
  BEFORE INSERT ON book_service_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_clinic_queue_on_appointment_safe();

-- 10. رسالة نجاح
SELECT 'تم إصلاح مشكلة أرقام الطابور بنجاح!' as message;
