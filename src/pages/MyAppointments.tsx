import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  Users,
  Activity,
  Pause,
  Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  patient_phone: string;
  patient_age: number;
  patient_gender: string;
  medical_history: string;
  notes: string;
  status: string;
  queue_number: number;
  queue_position: number;
  created_at: string;
  clinic: {
    id: string;
    name: string;
    doctor_name: string;
    specialization: string;
    consultation_fee: number;
    waiting_patients: number;
    max_patients_per_day: number;
    is_available: boolean;
  };
  health_center: {
    name: string;
    address: string;
    phone: string;
  };
}

interface QueueStatus {
  clinic_id: string;
  status: 'active' | 'paused' | 'closed';
  current_serving_queue_number: number;
  next_queue_number: number;
  last_updated: string;
}

interface ClinicQueue {
  clinic_id: string;
  current_queue_number: number;
  total_patients_today: number;
  last_updated: string;
}

const MyAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueStatuses, setQueueStatuses] = useState<Record<string, QueueStatus>>({});
  const [clinicQueues, setClinicQueues] = useState<Record<string, ClinicQueue>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchQueueData();
      
      // تحديث بيانات الطابور كل 30 ثانية
      const interval = setInterval(() => {
        fetchQueueData();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('book_service_appointments')
        .select(`
          *,
          clinic:book_service_clinics(
            id,
            name,
            doctor_name,
            specialization,
            consultation_fee,
            waiting_patients,
            max_patients_per_day,
            is_available,
            health_center:book_service_health_centers(
              name,
              address,
              phone
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        setAppointments(getMockAppointments());
      } else {
        setAppointments(data || getMockAppointments());
      }
    } catch (error) {
      console.error('Error:', error);
      setAppointments(getMockAppointments());
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueData = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // جلب بيانات حالة الطابور
      const { data: queueStatusData, error: queueStatusError } = await supabase
        .from('book_service_queue_status')
        .select('*');

      if (!queueStatusError && queueStatusData) {
        const statusMap: Record<string, QueueStatus> = {};
        queueStatusData.forEach(status => {
          statusMap[status.clinic_id] = status;
        });
        setQueueStatuses(statusMap);
      }

      // جلب بيانات طابور العيادات
      const { data: clinicQueueData, error: clinicQueueError } = await supabase
        .from('book_service_clinic_queues')
        .select('*');

      if (!clinicQueueError && clinicQueueData) {
        const queueMap: Record<string, ClinicQueue> = {};
        clinicQueueData.forEach(queue => {
          queueMap[queue.clinic_id] = queue;
        });
        setClinicQueues(queueMap);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching queue data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = async () => {
    await fetchQueueData();
    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات الطابور بنجاح",
    });
  };

  const getMockAppointments = (): Appointment[] => [
    {
      id: '1',
      appointment_date: new Date().toISOString().split('T')[0], // تاريخ اليوم
      appointment_time: '10:00',
      patient_name: 'أحمد محمد علي',
      patient_phone: '01234567890',
      patient_age: 30,
      patient_gender: 'male',
      medical_history: 'لا يوجد',
      notes: 'فحص دوري',
      status: 'pending',
      queue_number: 3,
      queue_position: 3,
      created_at: new Date().toISOString(),
      clinic: {
        id: 'clinic-1',
        name: 'عيادة الطب العام',
        doctor_name: 'د. أحمد محمد علي',
        specialization: 'طب عام',
        consultation_fee: 150,
        waiting_patients: 5,
        max_patients_per_day: 20,
        is_available: true,
        health_center: {
          name: 'مركز حدائق أكتوبر الطبي المتكامل',
          address: 'حدائق أكتوبر، شارع النيل، بجوار مول الأندلس، الحي السابع',
          phone: '01234567890'
        }
      }
    },
    {
      id: '2',
      appointment_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // أمس
      appointment_time: '14:30',
      patient_name: 'أحمد محمد علي',
      patient_phone: '01234567890',
      patient_age: 30,
      patient_gender: 'male',
      medical_history: 'لا يوجد',
      notes: 'متابعة',
      status: 'completed',
      queue_number: 2,
      queue_position: 2,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      clinic: {
        id: 'clinic-2',
        name: 'عيادة الأطفال',
        doctor_name: 'د. فاطمة عبد الرحمن',
        specialization: 'طب أطفال',
        consultation_fee: 200,
        waiting_patients: 0,
        max_patients_per_day: 15,
        is_available: true,
        health_center: {
          name: 'مركز حدائق أكتوبر الطبي المتكامل',
          address: 'حدائق أكتوبر، شارع النيل، بجوار مول الأندلس، الحي السابع',
          phone: '01234567890'
        }
      }
    }
  ];

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      // 1. الحصول على بيانات الموعد قبل الإلغاء
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) {
        throw new Error('الموعد غير موجود');
      }

      // 2. إلغاء الموعد
      const { error: cancelError } = await supabase
        .from('book_service_appointments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (cancelError) throw cancelError;

      // 3. تحديث عدد المرضى في العيادة (تقليل واحد)
      const { error: updateClinicError } = await supabase
        .from('book_service_clinics')
        .update({
          waiting_patients: Math.max(0, appointment.clinic.waiting_patients - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.clinic.id);

      if (updateClinicError) {
        console.error('Error updating clinic waiting patients:', updateClinicError);
        // لا نرمي الخطأ هنا لأن الإلغاء تم بنجاح
      }

      // 4. تحديث إجمالي المرضى في الطابور (تقليل واحد)
      const { data: queueData } = await supabase
        .from('book_service_clinic_queues')
        .select('*')
        .eq('clinic_id', appointment.clinic.id)
        .single();

      if (queueData) {
        const { error: updateQueueError } = await supabase
          .from('book_service_clinic_queues')
          .update({
            total_patients_today: Math.max(0, queueData.total_patients_today - 1),
            last_updated: new Date().toISOString()
          })
          .eq('clinic_id', appointment.clinic.id);

        if (updateQueueError) {
          console.error('Error updating queue total patients:', updateQueueError);
          // لا نرمي الخطأ هنا لأن الإلغاء تم بنجاح
        }
      }

      toast({
        title: "تم إلغاء الموعد",
        description: "تم إلغاء موعدك بنجاح",
      });

      // تحديث القائمة
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: 'cancelled' }
            : appointment
        )
      );
    } catch (error: any) {
      console.error('Cancel appointment error:', error);
      toast({
        title: "خطأ في الإلغاء",
        description: error.message || "حدث خطأ أثناء إلغاء الموعد",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    // تأكيد الحذف
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا الموعد؟\n\nسيتم حذف الموعد نهائياً ولا يمكن استرداده."
    );

    if (!confirmed) return;

    try {
      // 1. الحصول على بيانات الموعد قبل الحذف
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) {
        throw new Error('الموعد غير موجود');
      }

      // 2. حذف الموعد
      const { error: deleteError } = await supabase
        .from('book_service_appointments')
        .delete()
        .eq('id', appointmentId);

      if (deleteError) throw deleteError;

      // 3. تحديث عدد المرضى في العيادة (تقليل واحد)
      const { error: updateClinicError } = await supabase
        .from('book_service_clinics')
        .update({
          waiting_patients: Math.max(0, appointment.clinic.waiting_patients - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.clinic.id);

      if (updateClinicError) {
        console.error('Error updating clinic waiting patients:', updateClinicError);
        // لا نرمي الخطأ هنا لأن الحذف تم بنجاح
      }

      // 4. تحديث إجمالي المرضى في الطابور (تقليل واحد)
      const { data: queueData } = await supabase
        .from('book_service_clinic_queues')
        .select('*')
        .eq('clinic_id', appointment.clinic.id)
        .single();

      if (queueData) {
        const { error: updateQueueError } = await supabase
          .from('book_service_clinic_queues')
          .update({
            total_patients_today: Math.max(0, queueData.total_patients_today - 1),
            last_updated: new Date().toISOString()
          })
          .eq('clinic_id', appointment.clinic.id);

        if (updateQueueError) {
          console.error('Error updating queue total patients:', updateQueueError);
          // لا نرمي الخطأ هنا لأن الحذف تم بنجاح
        }
      }

      toast({
        title: "تم حذف الموعد",
        description: "تم حذف الموعد نهائياً من قائمتك",
      });

      // إزالة الموعد من القائمة
      setAppointments(prev => 
        prev.filter(appointment => appointment.id !== appointmentId)
      );
    } catch (error: any) {
      console.error('Delete appointment error:', error);
      toast({
        title: "خطأ في الحذف",
        description: error.message || "حدث خطأ أثناء حذف الموعد",
        variant: "destructive",
      });
    }
  };

  const handleViewAppointment = (appointmentId: string) => {
    navigate(`/appointment-confirmation/${appointmentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغي';
      case 'completed': return 'مكتمل';
      default: return 'غير محدد';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // حساب التقدم الفعلي للطابور
  const getQueueProgress = (appointment: Appointment) => {
    const clinicId = appointment.clinic.id;
    const queueStatus = queueStatuses[clinicId];
    const clinicQueue = clinicQueues[clinicId];
    
    if (!queueStatus || !clinicQueue) {
      return {
        currentServing: 0,
        patientsAhead: appointment.queue_position - 1,
        queueStatus: 'unknown',
        estimatedWaitTime: 0,
        isActive: false
      };
    }

    const currentServing = queueStatus.current_serving_queue_number;
    const patientsAhead = Math.max(0, appointment.queue_number - currentServing);
    const isActive = queueStatus.status === 'active';
    
    // تقدير وقت الانتظار (افتراض 15 دقيقة لكل مريض)
    const estimatedWaitTime = patientsAhead * 15;

    return {
      currentServing,
      patientsAhead,
      queueStatus: queueStatus.status,
      estimatedWaitTime,
      isActive
    };
  };

  const getQueueStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'closed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getQueueStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'paused': return 'متوقف مؤقتاً';
      case 'closed': return 'مغلق';
      default: return 'غير محدد';
    }
  };

  const getQueueStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'closed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) >= new Date() && apt.status !== 'cancelled'
  );

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) < new Date() || apt.status === 'cancelled'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg sticky top-0 z-50"
      >
        <div className="px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/health-centers')}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </Button>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calendar className="w-6 h-6 text-green-600" />
            <h1 className="text-lg font-bold text-gray-800">مواعيدي</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </Button>
        </div>
      </motion.div>

      <div className="px-4 py-6">
        {/* Last Update Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">آخر تحديث:</span>
              <span className="text-sm font-medium text-gray-800">
                {lastUpdate.toLocaleTimeString('ar-EG')}
              </span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-xs text-gray-500">
                {refreshing ? 'جاري التحديث...' : 'متصل'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">{upcomingAppointments.length}</div>
              <div className="text-xs opacity-90">قادمة</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">{pastAppointments.length}</div>
              <div className="text-xs opacity-90">سابقة</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <Stethoscope className="w-6 h-6 mx-auto mb-2" />
              <div className="text-lg font-bold">{appointments.length}</div>
              <div className="text-xs opacity-90">إجمالي</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">المواعيد القادمة</h2>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {getStatusIcon(appointment.status)}
                          <div>
                            <h3 className="font-bold text-gray-800">{appointment.clinic.doctor_name}</h3>
                            <p className="text-sm text-gray-600">{appointment.clinic.specialization}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{new Date(appointment.appointment_date).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span>{appointment.appointment_time}</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span className="truncate">{appointment.health_center.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <Stethoscope className="w-4 h-4 text-purple-600" />
                          <span>{appointment.clinic.consultation_fee} ج.م</span>
                        </div>
                      </div>

                      {/* Real-time Queue Information */}
                      {(() => {
                        const queueProgress = getQueueProgress(appointment);
                        return (
                          <div className={`rounded-xl p-3 mb-4 border ${
                            queueProgress.isActive 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                              : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Clock className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-semibold text-gray-700">معلومات الطابور المباشرة</span>
                              </div>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                {getQueueStatusIcon(queueProgress.queueStatus)}
                                <Badge className={`${getQueueStatusColor(queueProgress.queueStatus)} text-white text-xs`}>
                                  {getQueueStatusText(queueProgress.queueStatus)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="text-lg font-bold text-orange-600">#{appointment.queue_number}</div>
                                <div className="text-xs text-gray-600">رقم طابورك</div>
                              </div>
                              <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="text-lg font-bold text-blue-600">#{queueProgress.currentServing}</div>
                                <div className="text-xs text-gray-600">المُخدم حالياً</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className={`text-lg font-bold ${queueProgress.patientsAhead === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {queueProgress.patientsAhead}
                                </div>
                                <div className="text-xs text-gray-600">المرضى أمامك</div>
                              </div>
                              <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="text-lg font-bold text-purple-600">
                                  {queueProgress.estimatedWaitTime > 0 ? `${queueProgress.estimatedWaitTime} دقيقة` : 'دورك الآن'}
                                </div>
                                <div className="text-xs text-gray-600">الوقت المتوقع</div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {queueProgress.isActive && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>التقدم</span>
                                  <span>{queueProgress.currentServing} / {appointment.queue_number}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${Math.min(100, (queueProgress.currentServing / appointment.queue_number) * 100)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          onClick={() => handleViewAppointment(appointment.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center space-x-1 rtl:space-x-reverse"
                        >
                          <Eye className="w-4 h-4" />
                          <span>عرض</span>
                        </Button>
                        {appointment.status === 'pending' && (
                          <Button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center space-x-1 rtl:space-x-reverse text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>إلغاء</span>
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-center space-x-1 rtl:space-x-reverse text-red-600 border-red-600 hover:bg-red-50 px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">المواعيد السابقة</h2>
            <div className="space-y-4">
              {pastAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-lg opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {getStatusIcon(appointment.status)}
                          <div>
                            <h3 className="font-bold text-gray-800">{appointment.clinic.doctor_name}</h3>
                            <p className="text-sm text-gray-600">{appointment.clinic.specialization}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{new Date(appointment.appointment_date).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span>{appointment.appointment_time}</span>
                        </div>
                      </div>

                      {/* Queue Information for Past Appointments */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-3 mb-4 border border-gray-200">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-700">معلومات الطابور</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white rounded-lg p-2 shadow-sm">
                            <div className="text-lg font-bold text-orange-600">#{appointment.queue_number}</div>
                            <div className="text-xs text-gray-600">رقم الطابور</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 shadow-sm">
                            <div className="text-lg font-bold text-blue-600">{appointment.queue_position}</div>
                            <div className="text-xs text-gray-600">موضعك</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 shadow-sm">
                            <div className="text-lg font-bold text-red-600">{Math.max(0, appointment.queue_position - 1)}</div>
                            <div className="text-xs text-gray-600">كان أمامك</div>
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <Badge className="bg-gray-500 text-white">
                            {appointment.status === 'completed' ? 'تم الانتهاء' : 'موعد سابق'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button
                          onClick={() => handleViewAppointment(appointment.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center space-x-1 rtl:space-x-reverse"
                        >
                          <Eye className="w-4 h-4" />
                          <span>عرض</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-center space-x-1 rtl:space-x-reverse text-red-600 border-red-600 hover:bg-red-50 px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {appointments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Card className="bg-gradient-to-r from-gray-100 to-gray-200">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد مواعيد</h3>
                <p className="text-gray-600 mb-4">
                  لم تحجز أي مواعيد طبية بعد
                </p>
                <Button 
                  onClick={() => navigate('/health-centers')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  احجز موعد الآن
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default MyAppointments;
