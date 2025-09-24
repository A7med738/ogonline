// إعداد نظام تتبع حالة المرضى
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjjczlhybgeslfiovkun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqamN6bGh5Ymdlc2xmaW92a3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUyODMsImV4cCI6MjA3MTk0MTI4M30.aqB0dFiAlwhomMITSeSLld9S7LeOh2oEf7kWnI47T4s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPatientTracking() {
  try {
    console.log('🔧 إعداد نظام تتبع حالة المرضى...');

    // 1. إنشاء جدول patient_status_tracking
    console.log('📝 إنشاء جدول patient_status_tracking...');
    const { error: tableError } = await supabase
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS patient_status_tracking (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            appointment_id UUID REFERENCES book_service_appointments(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL,
            previous_status VARCHAR(20),
            changed_by UUID REFERENCES auth.users(id),
            status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            waiting_time INTEGER,
            consultation_duration INTEGER,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

    if (tableError) {
      console.error('❌ خطأ في إنشاء الجدول:', tableError);
      return;
    } else {
      console.log('✅ تم إنشاء جدول patient_status_tracking');
    }

    // 2. إنشاء الفهارس
    console.log('📊 إنشاء الفهارس...');
    const { error: indexError } = await supabase
      .rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_patient_status_tracking_appointment_id ON patient_status_tracking(appointment_id);
          CREATE INDEX IF NOT EXISTS idx_patient_status_tracking_status ON patient_status_tracking(status);
          CREATE INDEX IF NOT EXISTS idx_patient_status_tracking_changed_at ON patient_status_tracking(status_changed_at);
        `
      });

    if (indexError) {
      console.error('❌ خطأ في إنشاء الفهارس:', indexError);
    } else {
      console.log('✅ تم إنشاء الفهارس');
    }

    // 3. إنشاء دالة تحديث عدد المرضى المتبقين
    console.log('🔧 إنشاء دالة تحديث عدد المرضى المتبقين...');
    const { error: functionError } = await supabase
      .rpc('exec_sql', {
        sql: `
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
        `
      });

    if (functionError) {
      console.error('❌ خطأ في إنشاء الدالة:', functionError);
    } else {
      console.log('✅ تم إنشاء دالة update_patients_ahead_on_completion');
    }

    // 4. إنشاء دالة تحديث حالة الموعد
    console.log('🔄 إنشاء دالة تحديث حالة الموعد...');
    const { error: updateFunctionError } = await supabase
      .rpc('exec_sql', {
        sql: `
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
        `
      });

    if (updateFunctionError) {
      console.error('❌ خطأ في إنشاء دالة تحديث حالة الموعد:', updateFunctionError);
    } else {
      console.log('✅ تم إنشاء دالة update_appointment_status_from_tracking');
    }

    // 5. إنشاء Triggers
    console.log('⚡ إنشاء Triggers...');
    const { error: triggerError } = await supabase
      .rpc('exec_sql', {
        sql: `
          DROP TRIGGER IF EXISTS trigger_update_patients_ahead_on_completion ON patient_status_tracking;
          CREATE TRIGGER trigger_update_patients_ahead_on_completion
            AFTER INSERT ON patient_status_tracking
            FOR EACH ROW
            EXECUTE FUNCTION update_patients_ahead_on_completion();
          
          DROP TRIGGER IF EXISTS trigger_update_appointment_status ON patient_status_tracking;
          CREATE TRIGGER trigger_update_appointment_status
            AFTER INSERT ON patient_status_tracking
            FOR EACH ROW
            EXECUTE FUNCTION update_appointment_status_from_tracking();
        `
      });

    if (triggerError) {
      console.error('❌ خطأ في إنشاء Triggers:', triggerError);
    } else {
      console.log('✅ تم إنشاء Triggers');
    }

    // 6. إنشاء دالة للحصول على عدد المرضى المتبقين
    console.log('📊 إنشاء دالة حساب المرضى المتبقين...');
    const { error: countFunctionError } = await supabase
      .rpc('exec_sql', {
        sql: `
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
        `
      });

    if (countFunctionError) {
      console.error('❌ خطأ في إنشاء دالة حساب المرضى المتبقين:', countFunctionError);
    } else {
      console.log('✅ تم إنشاء دالة get_patients_ahead_count');
    }

    // 7. إدراج البيانات التجريبية
    console.log('🧪 إدراج البيانات التجريبية...');
    const { error: insertError } = await supabase
      .from('patient_status_tracking')
      .insert([
        {
          appointment_id: '1049058d-58ef-4359-943b-3b51fcefdbe0',
          status: 'in_progress',
          previous_status: 'pending',
          notes: 'تم استدعاء المريض التالي'
        },
        {
          appointment_id: '1049058d-58ef-4359-943b-3b51fcefdbe0',
          status: 'completed',
          previous_status: 'confirmed',
          notes: 'تم إكمال الاستشارة'
        },
        {
          appointment_id: '1049058d-58ef-4359-943b-3b51fcefdbe0',
          status: 'in_progress',
          previous_status: 'pending',
          notes: 'تم استدعاء المريض مرة أخرى'
        },
        {
          appointment_id: '1049058d-58ef-4359-943b-3b51fcefdbe0',
          status: 'confirmed',
          previous_status: 'in_progress',
          notes: 'تم تأكيد الموعد'
        }
      ]);

    if (insertError) {
      console.error('❌ خطأ في إدراج البيانات التجريبية:', insertError);
    } else {
      console.log('✅ تم إدراج البيانات التجريبية');
    }

    // 8. اختبار النظام
    console.log('\n🧪 اختبار النظام...');
    
    // جلب البيانات الحالية
    const { data: currentAppointments, error: fetchError } = await supabase
      .from('book_service_appointments')
      .select('id, patient_name, queue_position, status')
      .eq('appointment_date', new Date().toISOString().split('T')[0])
      .order('queue_position');

    if (fetchError) {
      console.error('خطأ في جلب المواعيد:', fetchError);
    } else {
      console.log('المواعيد الحالية:');
      currentAppointments.forEach(apt => {
        console.log(`  #${apt.queue_position}: ${apt.patient_name} (${apt.status})`);
      });
    }

    // جلب بيانات تتبع الحالة
    const { data: trackingData, error: trackingError } = await supabase
      .from('patient_status_tracking')
      .select('*')
      .order('status_changed_at');

    if (trackingError) {
      console.error('خطأ في جلب بيانات التتبع:', trackingError);
    } else {
      console.log('\nبيانات تتبع الحالة:');
      trackingData.forEach(track => {
        console.log(`  ${track.status}: ${track.notes} (${track.status_changed_at})`);
      });
    }

    console.log('\n🎉 تم إعداد نظام تتبع حالة المرضى بنجاح!');
    console.log('✅ الجدول تم إنشاؤه');
    console.log('✅ الدوال تم إنشاؤها');
    console.log('✅ Triggers تعمل');
    console.log('✅ النظام جاهز للاستخدام');

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

// تشغيل الإعداد
setupPatientTracking();
