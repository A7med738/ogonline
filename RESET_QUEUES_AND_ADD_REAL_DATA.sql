-- إعادة تعيين الطوابير وإضافة بيانات حقيقية
-- Reset Queues and Add Real Data

-- 1. حذف جميع المواعيد الموجودة
DELETE FROM book_service_appointments;

-- 2. إعادة تعيين الطوابير للعيادات
UPDATE book_service_clinics SET 
  waiting_patients = 0,
  updated_at = NOW();

-- 3. إضافة بيانات حقيقية للعيادات
UPDATE book_service_clinics SET 
  name = CASE id
    WHEN '550e8400-e29b-41d4-a716-446655440001' THEN 'عيادة الطب العام'
    WHEN '550e8400-e29b-41d4-a716-446655440002' THEN 'عيادة الأطفال'
    WHEN '550e8400-e29b-41d4-a716-446655440003' THEN 'عيادة النساء والتوليد'
    WHEN '550e8400-e29b-41d4-a716-446655440004' THEN 'عيادة القلب والأوعية الدموية'
    WHEN '550e8400-e29b-41d4-a716-446655440005' THEN 'عيادة العظام والمفاصل'
    WHEN '550e8400-e29b-41d4-a716-446655440006' THEN 'عيادة الأنف والأذن والحنجرة'
    WHEN '550e8400-e29b-41d4-a716-446655440007' THEN 'عيادة العيون'
    WHEN '550e8400-e29b-41d4-a716-446655440008' THEN 'عيادة الجلدية'
    WHEN '550e8400-e29b-41d4-a716-446655440009' THEN 'عيادة الجهاز الهضمي'
    WHEN '550e8400-e29b-41d4-a716-446655440010' THEN 'عيادة المسالك البولية'
    WHEN '550e8400-e29b-41d4-a716-446655440011' THEN 'عيادة الطب النفسي'
  END,
  doctor_name = CASE id
    WHEN '550e8400-e29b-41d4-a716-446655440001' THEN 'د. أحمد محمد علي'
    WHEN '550e8400-e29b-41d4-a716-446655440002' THEN 'د. فاطمة عبد الرحمن'
    WHEN '550e8400-e29b-41d4-a716-446655440003' THEN 'د. مريم حسن إبراهيم'
    WHEN '550e8400-e29b-41d4-a716-446655440004' THEN 'د. خالد سعد الدين'
    WHEN '550e8400-e29b-41d4-a716-446655440005' THEN 'د. عمر محمود أحمد'
    WHEN '550e8400-e29b-41d4-a716-446655440006' THEN 'د. نورا محمد حسن'
    WHEN '550e8400-e29b-41d4-a716-446655440007' THEN 'د. يوسف عبد الله'
    WHEN '550e8400-e29b-41d4-a716-446655440008' THEN 'د. سارة أحمد محمد'
    WHEN '550e8400-e29b-41d4-a716-446655440009' THEN 'د. محمد علي حسن'
    WHEN '550e8400-e29b-41d4-a716-446655440010' THEN 'د. عائشة محمود إبراهيم'
    WHEN '550e8400-e29b-41d4-a716-446655440011' THEN 'د. عبد الرحمن سعد الدين'
  END,
  specialization = CASE id
    WHEN '550e8400-e29b-41d4-a716-446655440001' THEN 'طب عام'
    WHEN '550e8400-e29b-41d4-a716-446655440002' THEN 'طب أطفال'
    WHEN '550e8400-e29b-41d4-a716-446655440003' THEN 'نساء وتوليد'
    WHEN '550e8400-e29b-41d4-a716-446655440004' THEN 'قلب وأوعية دموية'
    WHEN '550e8400-e29b-41d4-a716-446655440005' THEN 'عظام ومفاصل'
    WHEN '550e8400-e29b-41d4-a716-446655440006' THEN 'أنف وأذن وحنجرة'
    WHEN '550e8400-e29b-41d4-a716-446655440007' THEN 'عيون'
    WHEN '550e8400-e29b-41d4-a716-446655440008' THEN 'جلدية'
    WHEN '550e8400-e29b-41d4-a716-446655440009' THEN 'جهاز هضمي'
    WHEN '550e8400-e29b-41d4-a716-446655440010' THEN 'مسالك بولية'
    WHEN '550e8400-e29b-41d4-a716-446655440011' THEN 'طب نفسي'
  END,
  consultation_fee = CASE id
    WHEN '550e8400-e29b-41d4-a716-446655440001' THEN 150
    WHEN '550e8400-e29b-41d4-a716-446655440002' THEN 200
    WHEN '550e8400-e29b-41d4-a716-446655440003' THEN 250
    WHEN '550e8400-e29b-41d4-a716-446655440004' THEN 300
    WHEN '550e8400-e29b-41d4-a716-446655440005' THEN 280
    WHEN '550e8400-e29b-41d4-a716-446655440006' THEN 220
    WHEN '550e8400-e29b-41d4-a716-446655440007' THEN 200
    WHEN '550e8400-e29b-41d4-a716-446655440008' THEN 180
    WHEN '550e8400-e29b-41d4-a716-446655440009' THEN 270
    WHEN '550e8400-e29b-41d4-a716-446655440010' THEN 260
    WHEN '550e8400-e29b-41d4-a716-446655440011' THEN 320
  END,
  max_patients_per_day = CASE id
    WHEN '550e8400-e29b-41d4-a716-446655440001' THEN 30
    WHEN '550e8400-e29b-41d4-a716-446655440002' THEN 25
    WHEN '550e8400-e29b-41d4-a716-446655440003' THEN 20
    WHEN '550e8400-e29b-41d4-a716-446655440004' THEN 15
    WHEN '550e8400-e29b-41d4-a716-446655440005' THEN 18
    WHEN '550e8400-e29b-41d4-a716-446655440006' THEN 22
    WHEN '550e8400-e29b-41d4-a716-446655440007' THEN 25
    WHEN '550e8400-e29b-41d4-a716-446655440008' THEN 28
    WHEN '550e8400-e29b-41d4-a716-446655440009' THEN 16
    WHEN '550e8400-e29b-41d4-a716-446655440010' THEN 20
    WHEN '550e8400-e29b-41d4-a716-446655440011' THEN 12
  END,
  updated_at = NOW();

-- 4. إضافة مواعيد تجريبية حقيقية
INSERT INTO book_service_appointments (
  user_id,
  clinic_id,
  appointment_date,
  appointment_time,
  patient_name,
  patient_phone,
  patient_age,
  patient_gender,
  medical_history,
  notes,
  status,
  queue_number,
  queue_position
) VALUES 
-- مواعيد اليوم
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '09:00', 'أحمد محمد علي', '01234567890', 30, 'male', 'لا يوجد', 'فحص دوري', 'pending', 1, 1),
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, '10:30', 'فاطمة أحمد حسن', '01234567891', 25, 'female', 'حساسية', 'متابعة', 'pending', 2, 2),
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, '11:00', 'مريم عبد الله', '01234567892', 28, 'female', 'لا يوجد', 'فحص روتيني', 'pending', 3, 3),
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440004', CURRENT_DATE, '14:00', 'خالد محمد إبراهيم', '01234567893', 45, 'male', 'ضغط دم', 'متابعة', 'pending', 4, 4),
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440005', CURRENT_DATE, '15:30', 'عمر أحمد حسن', '01234567894', 35, 'male', 'إصابة رياضية', 'علاج', 'pending', 5, 5),

-- مواعيد أمس (مكتملة)
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', '09:00', 'سارة محمد علي', '01234567895', 32, 'female', 'لا يوجد', 'فحص دوري', 'completed', 1, 1),
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day', '10:30', 'يوسف عبد الرحمن', '01234567896', 8, 'male', 'حمى', 'علاج', 'completed', 2, 2),
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '1 day', '11:00', 'نورا أحمد محمد', '01234567897', 26, 'female', 'لا يوجد', 'فحص روتيني', 'completed', 3, 3),

-- مواعيد قبل أمس (مكتملة)
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440004', CURRENT_DATE - INTERVAL '2 days', '14:00', 'محمد علي حسن', '01234567898', 50, 'male', 'قلب', 'متابعة', 'completed', 1, 1),
('5fa07124-171d-4787-966e-25ab3b20bab0', '550e8400-e29b-41d4-a716-446655440005', CURRENT_DATE - INTERVAL '2 days', '15:30', 'عائشة محمود إبراهيم', '01234567899', 40, 'female', 'عظام', 'علاج', 'completed', 2, 2);

-- 5. تحديث عدد المرضى المنتظرين لكل عيادة
UPDATE book_service_clinics SET 
  waiting_patients = (
    SELECT COUNT(*) 
    FROM book_service_appointments 
    WHERE clinic_id = book_service_clinics.id 
    AND appointment_date = CURRENT_DATE 
    AND status = 'pending'
  ),
  updated_at = NOW();

-- 6. عرض النتائج
SELECT 
  c.name as clinic_name,
  c.doctor_name,
  c.specialization,
  c.consultation_fee,
  c.waiting_patients,
  c.max_patients_per_day,
  COUNT(a.id) as total_appointments_today
FROM book_service_clinics c
LEFT JOIN book_service_appointments a ON c.id = a.clinic_id AND a.appointment_date = CURRENT_DATE
GROUP BY c.id, c.name, c.doctor_name, c.specialization, c.consultation_fee, c.waiting_patients, c.max_patients_per_day
ORDER BY c.name;

-- 7. عرض المواعيد اليوم
SELECT 
  a.queue_number,
  a.queue_position,
  a.patient_name,
  a.appointment_time,
  c.doctor_name,
  c.specialization,
  a.status
FROM book_service_appointments a
JOIN book_service_clinics c ON a.clinic_id = c.id
WHERE a.appointment_date = CURRENT_DATE
ORDER BY a.queue_number;
