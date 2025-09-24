# نظام تتبع حالة المرضى (Patient Status Tracking System)

## 📋 نظرة عامة

هذا النظام يتيح تتبع حالة المرضى في الطابور وتحديث عدد المرضى المتبقين تلقائياً عند اكتمال حالة المريض.

## 🗄️ الجداول المطلوبة

### 1. جدول `patient_status_tracking`
```sql
CREATE TABLE patient_status_tracking (
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
```

## 🔧 الدوال المتاحة

### 1. `updatePatientStatus(appointmentId, newStatus, previousStatus, notes)`
تحديث حالة المريض وتحديث أرقام الطابور تلقائياً.

**المعاملات:**
- `appointmentId`: معرف الموعد
- `newStatus`: الحالة الجديدة (pending, confirmed, in_progress, completed, cancelled)
- `previousStatus`: الحالة السابقة (اختياري)
- `notes`: ملاحظات إضافية (اختياري)

**مثال الاستخدام:**
```javascript
import { updatePatientStatus } from './src/utils/patientTracking';

// تحديث حالة المريض إلى "مكتمل"
const result = await updatePatientStatus(
  'appointment-id-here',
  'completed',
  'in_progress',
  'تم إكمال الاستشارة بنجاح'
);

if (result.success) {
  console.log('تم تحديث الحالة بنجاح');
} else {
  console.error('خطأ في تحديث الحالة:', result.error);
}
```

### 2. `getPatientsAheadCount(appointmentId)`
حساب عدد المرضى المتبقين أمام مريض معين.

**المعاملات:**
- `appointmentId`: معرف الموعد

**مثال الاستخدام:**
```javascript
import { getPatientsAheadCount } from './src/utils/patientTracking';

const aheadCount = await getPatientsAheadCount('appointment-id-here');
console.log(`المرضى المتبقين: ${aheadCount}`);
```

### 3. `getCurrentQueueStatus(clinicId)`
الحصول على حالة الطابور الحالية للعيادة.

**المعاملات:**
- `clinicId`: معرف العيادة

**مثال الاستخدام:**
```javascript
import { getCurrentQueueStatus } from './src/utils/patientTracking';

const queueStatus = await getCurrentQueueStatus('clinic-id-here');
console.log(`الرقم الحالي المقدم: ${queueStatus.currentServing}`);
console.log(`إجمالي المرضى: ${queueStatus.totalPatients}`);
console.log(`المرضى المتبقين: ${queueStatus.patientsAhead}`);
console.log(`وقت الانتظار المتوقع: ${queueStatus.estimatedWaitTime} دقيقة`);
```

### 4. `getPatientStatusHistory(appointmentId)`
الحصول على تاريخ تتبع حالة مريض معين.

**المعاملات:**
- `appointmentId`: معرف الموعد

**مثال الاستخدام:**
```javascript
import { getPatientStatusHistory } from './src/utils/patientTracking';

const history = await getPatientStatusHistory('appointment-id-here');
history.forEach(record => {
  console.log(`${record.status}: ${record.notes} (${record.status_changed_at})`);
});
```

## 🔄 آلية العمل

### عند تحديث حالة المريض إلى "completed":

1. **إدراج سجل تتبع الحالة** في جدول `patient_status_tracking`
2. **تحديث حالة الموعد** في جدول `book_service_appointments`
3. **تقليل أرقام الطابور** لجميع المرضى الذين يأتون بعد هذا المريض
4. **تحديث إحصائيات الطابور** في جدول `book_service_clinic_queues`
5. **تحديث عدد المرضى** في جدول `book_service_clinics`
6. **تحديث حالة الطابور** في جدول `book_service_queue_status`

### مثال على التدفق:

```
قبل التحديث:
#1: أحمد (in_progress)
#2: محمد (pending)
#3: فاطمة (pending)
#4: علي (pending)

بعد تحديث أحمد إلى "completed":
#1: أحمد (completed)
#1: محمد (pending) ← تم تقليل الرقم من 2 إلى 1
#2: فاطمة (pending) ← تم تقليل الرقم من 3 إلى 2
#3: علي (pending) ← تم تقليل الرقم من 4 إلى 3
```

## 📊 حالات المرضى

- **pending**: في الانتظار
- **confirmed**: تم تأكيد الموعد
- **in_progress**: قيد المعالجة
- **completed**: مكتمل
- **cancelled**: ملغي

## 🔒 الأمان

النظام يستخدم Row Level Security (RLS) لضمان أن:
- المستخدمون يمكنهم رؤية وتعديل مواعيدهم فقط
- المديرون والأطباء يمكنهم إدارة جميع المواعيد
- البيانات محمية ومقيدة حسب الصلاحيات

## 🚀 التطبيق

1. **تشغيل ملف SQL**: `create_patient_status_tracking_final.sql`
2. **استيراد الدوال**: في المكونات التي تحتاجها
3. **استخدام الدوال**: حسب الحاجة في التطبيق

## 📝 ملاحظات مهمة

- النظام يعمل تلقائياً عند تحديث الحالة إلى "completed"
- جميع التحديثات تتم بشكل متزامن لضمان دقة البيانات
- النظام يحافظ على ترتيب الطابور الصحيح
- يمكن تتبع تاريخ جميع التغييرات في الحالة
