import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  DollarSign,
  Users,
  Stethoscope,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Clinic {
  id: string;
  name: string;
  doctor_name: string;
  specialization: string;
  consultation_fee: number;
  waiting_patients: number;
  max_patients_per_day: number;
}

interface AppointmentForm {
  patient_name: string;
  patient_phone: string;
  patient_age: string;
  patient_gender: string;
  medical_history: string;
  notes: string;
}

const BookAppointment = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AppointmentForm>({
    patient_name: '',
    patient_phone: '',
    patient_age: '',
    patient_gender: '',
    medical_history: '',
    notes: ''
  });

  useEffect(() => {
    if (clinicId) {
      fetchClinicData();
    }
  }, [clinicId]);

  const fetchClinicData = async () => {
    try {
      // إذا كان clinicId رقم، استخدم البيانات التجريبية
      if (clinicId && !clinicId.includes('-')) {
        console.log('Using mock data for clinic ID:', clinicId);
        setClinic(getMockClinic());
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('book_service_clinics')
        .select('*')
        .eq('id', clinicId)
        .single();

      if (error) {
        console.error('Error fetching clinic:', error);
        setClinic(getMockClinic());
      } else {
        setClinic(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setClinic(getMockClinic());
    } finally {
      setLoading(false);
    }
  };

  const getMockClinic = (): Clinic => ({
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'عيادة الطب العام',
    doctor_name: 'د. أحمد محمد علي',
    specialization: 'طب عام',
    consultation_fee: 150,
    waiting_patients: 3,
    max_patients_per_day: 25
  });

  const handleInputChange = (field: keyof AppointmentForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clinic) return;

    // التحقق من صحة البيانات
    if (!formData.patient_name || !formData.patient_phone || !formData.patient_age || 
        !formData.patient_gender) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // الحصول على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "خطأ في المصادقة",
          description: "يرجى تسجيل الدخول أولاً",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // 1. الحصول على بيانات الطابور الحالية للعيادة
      const { data: queueData, error: queueError } = await supabase
        .from('book_service_clinic_queues')
        .select('*')
        .eq('clinic_id', clinic.id)
        .single();

      if (queueError && queueError.code !== 'PGRST116') {
        console.error('Error fetching queue data:', queueError);
        throw queueError;
      }

      // 2. حساب رقم الطابور التالي
      const nextQueueNumber = queueData ? queueData.current_queue_number + 1 : 1;
      const queuePosition = nextQueueNumber;

      // 3. إنشاء الحجز مع رقم الطابور المحسوب
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('book_service_appointments')
        .insert({
          user_id: user.id,
          clinic_id: clinic.id,
          appointment_date: new Date().toISOString().split('T')[0], // تاريخ اليوم
          appointment_time: '09:00', // وقت افتراضي
          patient_name: formData.patient_name,
          patient_phone: formData.patient_phone,
          patient_age: parseInt(formData.patient_age),
          patient_gender: formData.patient_gender,
          medical_history: formData.medical_history,
          notes: formData.notes,
          status: 'pending',
          queue_number: nextQueueNumber,
          queue_position: queuePosition
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // 4. تحديث أو إنشاء بيانات الطابور للعيادة
      if (queueData) {
        // تحديث الطابور الموجود
        const { error: updateQueueError } = await supabase
          .from('book_service_clinic_queues')
          .update({
            current_queue_number: nextQueueNumber,
            total_patients_today: queueData.total_patients_today + 1,
            last_updated: new Date().toISOString()
          })
          .eq('clinic_id', clinic.id);

        if (updateQueueError) {
          console.error('Error updating queue:', updateQueueError);
          // لا نرمي الخطأ هنا لأن الحجز تم بنجاح
        }
      } else {
        // إنشاء طابور جديد للعيادة
        const { error: createQueueError } = await supabase
          .from('book_service_clinic_queues')
          .insert({
            clinic_id: clinic.id,
            current_queue_number: nextQueueNumber,
            total_patients_today: 1,
            last_updated: new Date().toISOString()
          });

        if (createQueueError) {
          console.error('Error creating queue:', createQueueError);
          // لا نرمي الخطأ هنا لأن الحجز تم بنجاح
        }
      }

      // 5. تحديث عدد المرضى في العيادة
      const { error: updateClinicError } = await supabase
        .from('book_service_clinics')
        .update({
          waiting_patients: clinic.waiting_patients + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinic.id);

      if (updateClinicError) {
        console.error('Error updating clinic waiting patients:', updateClinicError);
        // لا نرمي الخطأ هنا لأن الحجز تم بنجاح
      }

      toast({
        title: "تم الحجز بنجاح! 🎉",
        description: `تم حجز موعدك برقم الطابور #${nextQueueNumber}`,
        action: <CheckCircle className="text-green-500" />,
      });

      // الانتقال لصفحة تأكيد الحجز
      navigate(`/appointment-confirmation/${appointmentData.id}`);
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "خطأ في الحجز",
        description: error.message || "حدث خطأ أثناء إنشاء الحجز",
        variant: "destructive",
        action: <AlertCircle className="text-red-500" />,
      });
    } finally {
      setSubmitting(false);
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

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">العيادة غير موجودة</h3>
          <Button onClick={() => navigate('/health-centers')} className="mt-4">
            العودة للمراكز الصحية
          </Button>
        </Card>
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
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </Button>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Calendar className="w-6 h-6 text-green-600" />
            <h1 className="text-lg font-bold text-gray-800">حجز موعد</h1>
          </div>
          <div className="w-16"></div>
        </div>
      </motion.div>

      <div className="px-4 py-6">
        {/* Clinic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="overflow-hidden shadow-lg">
            <div className="relative h-24 bg-gradient-to-r from-green-500 to-emerald-600">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-4 left-4 text-white">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div className="absolute bottom-4 right-4 text-white">
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-semibold">{clinic.waiting_patients}</span>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{clinic.name}</h2>
              <p className="text-gray-600 text-sm mb-3 flex items-center">
                <User className="w-4 h-4 ml-2 rtl:mr-2 text-blue-600" />
                {clinic.doctor_name}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">{clinic.consultation_fee} ج.م</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {clinic.specialization}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات المريض</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient_name">الاسم الكامل *</Label>
                    <Input
                      id="patient_name"
                      value={formData.patient_name}
                      onChange={(e) => handleInputChange('patient_name', e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient_phone">رقم الهاتف *</Label>
                    <Input
                      id="patient_phone"
                      type="tel"
                      value={formData.patient_phone}
                      onChange={(e) => handleInputChange('patient_phone', e.target.value)}
                      placeholder="01xxxxxxxxx"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient_age">العمر *</Label>
                    <Input
                      id="patient_age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.patient_age}
                      onChange={(e) => handleInputChange('patient_age', e.target.value)}
                      placeholder="العمر"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient_gender">الجنس *</Label>
                    <Select value={formData.patient_gender} onValueChange={(value) => handleInputChange('patient_gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الجنس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>


                {/* Medical Information */}
                <div>
                  <Label htmlFor="medical_history">التاريخ المرضي</Label>
                  <Textarea
                    id="medical_history"
                    value={formData.medical_history}
                    onChange={(e) => handleInputChange('medical_history', e.target.value)}
                    placeholder="أي أمراض مزمنة أو أدوية تتناولها حالياً..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="أي ملاحظات أو أسئلة تريد طرحها على الطبيب..."
                    rows={2}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>جاري الحجز...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>تأكيد الحجز</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default BookAppointment;
