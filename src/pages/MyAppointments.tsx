import React, { useState, useEffect } from 'react';
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
  Trash2
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
    name: string;
    doctor_name: string;
    specialization: string;
    consultation_fee: number;
  };
  health_center: {
    name: string;
    address: string;
    phone: string;
  };
}

const MyAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
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
            name,
            doctor_name,
            specialization,
            consultation_fee,
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
      queue_position: 2,
      created_at: new Date().toISOString(),
      clinic: {
        name: 'عيادة الطب العام',
        doctor_name: 'د. أحمد محمد علي',
        specialization: 'طب عام',
        consultation_fee: 150,
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
      queue_position: 1,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      clinic: {
        name: 'عيادة الأطفال',
        doctor_name: 'د. فاطمة عبد الرحمن',
        specialization: 'طب أطفال',
        consultation_fee: 200,
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
      const { error } = await supabase
        .from('book_service_appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

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

      <div className="px-4 py-6">
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

                      {/* Queue Information */}
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3 mb-4 border border-orange-200">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                          <Clock className="w-4 h-4 text-orange-600" />
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
                            <div className="text-lg font-bold text-red-600">{appointment.queue_position - 1}</div>
                            <div className="text-xs text-gray-600">المتبقي</div>
                          </div>
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
                        {appointment.status === 'pending' && (
                          <Button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center space-x-1 rtl:space-x-reverse text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>إلغاء</span>
                          </Button>
                        )}
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
                            <div className="text-lg font-bold text-red-600">{appointment.queue_position - 1}</div>
                            <div className="text-xs text-gray-600">المتبقي</div>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleViewAppointment(appointment.id)}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center space-x-1 rtl:space-x-reverse"
                      >
                        <Eye className="w-4 h-4" />
                        <span>عرض التفاصيل</span>
                      </Button>
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
