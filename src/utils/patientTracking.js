// نظام تتبع حالة المرضى للاستخدام في التطبيق
import { supabase } from '../integrations/supabase/client';

// دالة لتحديث حالة المريض
export async function updatePatientStatus(appointmentId, newStatus, previousStatus = null, notes = null) {
  try {
    console.log(`🔄 تحديث حالة الموعد ${appointmentId} إلى ${newStatus}...`);

    // 1. إدراج سجل تتبع الحالة
    const { data: trackingData, error: trackingError } = await supabase
      .from('patient_status_tracking')
      .insert({
        appointment_id: appointmentId,
        status: newStatus,
        previous_status: previousStatus,
        notes: notes,
        status_changed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (trackingError) {
      console.error('❌ خطأ في إدراج سجل التتبع:', trackingError);
      return { success: false, error: trackingError };
    }

    // 2. تحديث حالة الموعد في الجدول الرئيسي
    const { error: updateError } = await supabase
      .from('book_service_appointments')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('❌ خطأ في تحديث حالة الموعد:', updateError);
      return { success: false, error: updateError };
    }

    // 3. إذا كانت الحالة "completed"، تحديث أرقام الطابور
    if (newStatus === 'completed') {
      console.log('🎯 تحديث أرقام الطابور للمرضى المتبقين...');
      
      // الحصول على بيانات الموعد المكتمل
      const { data: completedAppointment, error: fetchError } = await supabase
        .from('book_service_appointments')
        .select('clinic_id, queue_position')
        .eq('id', appointmentId)
        .single();

      if (fetchError) {
        console.error('❌ خطأ في جلب بيانات الموعد المكتمل:', fetchError);
        return { success: false, error: fetchError };
      }

      // جلب جميع المرضى الذين يأتون بعد هذا المريض
      const { data: patientsAfter, error: fetchAfterError } = await supabase
        .from('book_service_appointments')
        .select('id, queue_position')
        .eq('clinic_id', completedAppointment.clinic_id)
        .eq('appointment_date', new Date().toISOString().split('T')[0])
        .in('status', ['pending', 'confirmed', 'in_progress'])
        .gt('queue_position', completedAppointment.queue_position)
        .order('queue_position');

      if (!fetchAfterError && patientsAfter) {
        // تحديث كل مريض على حدة
        for (const patient of patientsAfter) {
          const { error: updatePatientError } = await supabase
            .from('book_service_appointments')
            .update({
              queue_position: patient.queue_position - 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', patient.id);

          if (updatePatientError) {
            console.error(`❌ خطأ في تحديث المريض ${patient.id}:`, updatePatientError);
          }
        }
        console.log(`✅ تم تحديث ${patientsAfter.length} مريض`);
      }

      // تحديث إحصائيات الطابور
      const { data: currentQueue, error: queueFetchError } = await supabase
        .from('book_service_clinic_queues')
        .select('total_patients_today')
        .eq('clinic_id', completedAppointment.clinic_id)
        .single();

      if (!queueFetchError && currentQueue) {
        const newTotal = Math.max(0, currentQueue.total_patients_today - 1);
        const { error: queueUpdateError } = await supabase
          .from('book_service_clinic_queues')
          .update({
            total_patients_today: newTotal,
            last_updated: new Date().toISOString()
          })
          .eq('clinic_id', completedAppointment.clinic_id);

        if (queueUpdateError) {
          console.error('❌ خطأ في تحديث إحصائيات الطابور:', queueUpdateError);
        }
      }

      // تحديث عدد المرضى في العيادة
      const { data: currentClinic, error: clinicFetchError } = await supabase
        .from('book_service_clinics')
        .select('waiting_patients')
        .eq('id', completedAppointment.clinic_id)
        .single();

      if (!clinicFetchError && currentClinic) {
        const newWaiting = Math.max(0, currentClinic.waiting_patients - 1);
        const { error: clinicUpdateError } = await supabase
          .from('book_service_clinics')
          .update({
            waiting_patients: newWaiting,
            updated_at: new Date().toISOString()
          })
          .eq('id', completedAppointment.clinic_id);

        if (clinicUpdateError) {
          console.error('❌ خطأ في تحديث عدد المرضى في العيادة:', clinicUpdateError);
        }
      }

      // تحديث حالة الطابور
      const { error: statusUpdateError } = await supabase
        .from('book_service_queue_status')
        .update({
          current_serving_queue_number: completedAppointment.queue_position,
          last_updated: new Date().toISOString()
        })
        .eq('clinic_id', completedAppointment.clinic_id);

      if (statusUpdateError) {
        console.error('❌ خطأ في تحديث حالة الطابور:', statusUpdateError);
      }
    }

    return { success: true, data: trackingData };

  } catch (error) {
    console.error('❌ خطأ عام في تحديث حالة المريض:', error);
    return { success: false, error };
  }
}

// دالة للحصول على عدد المرضى المتبقين أمام مريض معين
export async function getPatientsAheadCount(appointmentId) {
  try {
    // الحصول على بيانات الموعد
    const { data: appointment, error: appointmentError } = await supabase
      .from('book_service_appointments')
      .select('clinic_id, queue_position, status')
      .eq('id', appointmentId)
      .single();

    if (appointmentError) {
      console.error('خطأ في جلب بيانات الموعد:', appointmentError);
      return 0;
    }

    // إذا تم إكمال الموعد
    if (appointment.status === 'completed') {
      return 0;
    }

    // حساب عدد المرضى المتبقين
    const { data: aheadPatients, error: countError } = await supabase
      .from('book_service_appointments')
      .select('id')
      .eq('clinic_id', appointment.clinic_id)
      .eq('appointment_date', new Date().toISOString().split('T')[0])
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .lt('queue_position', appointment.queue_position);

    if (countError) {
      console.error('خطأ في حساب المرضى المتبقين:', countError);
      return 0;
    }

    return aheadPatients?.length || 0;

  } catch (error) {
    console.error('❌ خطأ عام في حساب المرضى المتبقين:', error);
    return 0;
  }
}

// دالة للحصول على حالة الطابور الحالية
export async function getCurrentQueueStatus(clinicId) {
  try {
    // الحصول على الرقم الحالي المقدم
    const { data: queueStatus, error: statusError } = await supabase
      .from('book_service_queue_status')
      .select('current_serving_queue_number')
      .eq('clinic_id', clinicId)
      .single();

    // الحصول على إجمالي المرضى
    const { data: queueData, error: queueError } = await supabase
      .from('book_service_clinic_queues')
      .select('total_patients_today')
      .eq('clinic_id', clinicId)
      .single();

    // حساب المرضى المتبقين
    const { data: remainingPatients, error: remainingError } = await supabase
      .from('book_service_appointments')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('appointment_date', new Date().toISOString().split('T')[0])
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .gt('queue_position', queueStatus?.current_serving_queue_number || 0);

    const currentServing = queueStatus?.current_serving_queue_number || 0;
    const totalPatients = queueData?.total_patients_today || 0;
    const patientsAhead = remainingPatients?.length || 0;
    const estimatedWaitTime = patientsAhead * 15; // 15 دقيقة لكل مريض

    return {
      currentServing,
      totalPatients,
      patientsAhead,
      estimatedWaitTime
    };

  } catch (error) {
    console.error('❌ خطأ في جلب حالة الطابور:', error);
    return {
      currentServing: 0,
      totalPatients: 0,
      patientsAhead: 0,
      estimatedWaitTime: 0
    };
  }
}

// دالة للحصول على تاريخ تتبع حالة مريض معين
export async function getPatientStatusHistory(appointmentId) {
  try {
    const { data: statusHistory, error: historyError } = await supabase
      .from('patient_status_tracking')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('status_changed_at', { ascending: false });

    if (historyError) {
      console.error('خطأ في جلب تاريخ الحالة:', historyError);
      return [];
    }

    return statusHistory || [];

  } catch (error) {
    console.error('❌ خطأ عام في جلب تاريخ الحالة:', error);
    return [];
  }
}
