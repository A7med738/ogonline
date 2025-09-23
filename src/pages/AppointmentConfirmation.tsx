import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Stethoscope,
  ArrowLeft,
  Home,
  Download,
  Share2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentDetails {
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

const AppointmentConfirmation = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
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
        .eq('id', appointmentId)
        .single();

      if (error) {
        console.error('Error fetching appointment:', error);
        setAppointment(getMockAppointment());
      } else {
        setAppointment(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setAppointment(getMockAppointment());
    } finally {
      setLoading(false);
    }
  };

  const getMockAppointment = (): AppointmentDetails => ({
    id: 'mock-appointment-id',
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
  });

  const handleDownloadTicket = () => {
    // هنا يمكن إضافة منطق تحميل التذكرة
    alert('سيتم تحميل تذكرة الموعد قريباً');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'تذكرة موعد طبي',
        text: `موعد طبي مع ${appointment?.clinic.doctor_name} في ${appointment?.health_center.name}`,
        url: window.location.href
      });
    } else {
      // نسخ الرابط للحافظة
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط للحافظة');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغي';
      default: return 'غير محدد';
    }
  };

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

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">الحجز غير موجود</h3>
          <Button onClick={() => navigate('/health-centers')} className="mt-4">
            العودة للمراكز الصحية
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">

      <div className="px-4 py-6">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">تم الحجز بنجاح! 🎉</h2>
          <p className="text-gray-600">سيتم تأكيد موعدك خلال 24 ساعة</p>
        </motion.div>

        {/* Appointment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-6"
        >
          {/* Status Card */}
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar className="w-6 h-6" />
                  <div>
                    <div className="font-bold">رقم الحجز: #{appointment.id.slice(-8)}</div>
                    <div className="text-sm opacity-90">تم إنشاء الحجز بنجاح</div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                  {getStatusText(appointment.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Info */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Stethoscope className="w-5 h-5 ml-2 rtl:mr-2 text-green-600" />
                تفاصيل الموعد
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-800">التاريخ</div>
                      <div className="text-gray-600">{new Date(appointment.appointment_date).toLocaleDateString('ar-EG')}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-800">الوقت</div>
                      <div className="text-gray-600">{appointment.appointment_time}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-semibold text-gray-800">الطبيب</div>
                      <div className="text-gray-600">{appointment.clinic.doctor_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Stethoscope className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-gray-800">التخصص</div>
                      <div className="text-gray-600">{appointment.clinic.specialization}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queue Information */}
          <Card className="shadow-lg border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 ml-2 rtl:mr-2 text-orange-600" />
                معلومات الطابور
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-3xl font-bold text-orange-600 mb-2">#{appointment.queue_number}</div>
                  <div className="text-sm font-semibold text-gray-700">رقم الطابور</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{appointment.queue_position}</div>
                  <div className="text-sm font-semibold text-gray-700">موضعك في الطابور</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-3xl font-bold text-red-600 mb-2">{appointment.queue_position - 1}</div>
                  <div className="text-sm font-semibold text-gray-700">المرضى المتبقين</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-800 mb-1">معلومات مهمة:</div>
                    <div className="text-sm text-blue-700">
                      • يرجى الحضور قبل موعدك بـ 15 دقيقة<br/>
                      • سيتم استدعاؤك حسب رقم الطابور<br/>
                      • انتظر دورك في الطابور
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Info */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 ml-2 rtl:mr-2 text-blue-600" />
                معلومات المريض
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-800">الاسم</div>
                  <div className="text-gray-600">{appointment.patient_name}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">الهاتف</div>
                  <div className="text-gray-600">{appointment.patient_phone}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">العمر</div>
                  <div className="text-gray-600">{appointment.patient_age} سنة</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">الجنس</div>
                  <div className="text-gray-600">{appointment.patient_gender === 'male' ? 'ذكر' : 'أنثى'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Center Info */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 ml-2 rtl:mr-2 text-red-600" />
                معلومات المركز الصحي
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="font-semibold text-gray-800">اسم المركز</div>
                  <div className="text-gray-600">{appointment.clinic?.health_center?.name || 'مركز الصحة العامة'}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">العنوان</div>
                  <div className="text-gray-600">{appointment.clinic?.health_center?.address || 'شارع الملك فهد، الرياض'}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">الهاتف</div>
                  <div className="text-gray-600">{appointment.clinic?.health_center?.phone || '+966 11 123 4567'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleDownloadTicket}
              variant="outline"
              className="flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <Download className="w-4 h-4" />
              <span>تحميل التذكرة</span>
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة</span>
            </Button>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/my-appointments')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <Calendar className="w-5 h-5" />
              <span>عرض مواعيدي</span>
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <Home className="w-5 h-5" />
              <span>العودة للرئيسية</span>
            </Button>
          </div>
        </motion.div>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
