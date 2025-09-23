import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Stethoscope,
  Clock,
  Users,
  MapPin,
  Phone,
  Star,
  Calendar,
  User,
  DollarSign,
  Activity,
  Building2,
  ChevronRight,
  Eye,
  Heart,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  working_hours: string;
  description?: string;
  image_url?: string;
  google_maps_url?: string;
}

interface Clinic {
  id: string;
  health_center_id: string;
  name: string;
  doctor_name: string;
  specialization: string;
  consultation_fee: number;
  waiting_patients: number;
  max_patients_per_day: number;
  is_available: boolean;
}

const Clinics = () => {
  const { centerId } = useParams<{ centerId: string }>();
  const navigate = useNavigate();
  const [healthCenter, setHealthCenter] = useState<HealthCenter | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (centerId) {
      fetchHealthCenterAndClinics();
    }
  }, [centerId]);

  const fetchHealthCenterAndClinics = async () => {
    try {
      // جلب بيانات المركز الصحي
          const { data: centerData, error: centerError } = await supabase
            .from('book_service_health_centers')
            .select('*')
            .eq('id', centerId)
            .single();

      if (centerError) {
        console.error('Error fetching health center:', centerError);
        // استخدام بيانات افتراضية
        setHealthCenter(getMockHealthCenter());
        setClinics(getMockClinics());
      } else {
        setHealthCenter(centerData);
        
        // جلب بيانات العيادات
        const { data: clinicsData, error: clinicsError } = await supabase
          .from('book_service_clinics')
          .select('*')
          .eq('health_center_id', centerId)
          .eq('is_available', true)
          .order('specialization');

        if (clinicsError) {
          console.error('Error fetching clinics:', clinicsError);
          setClinics(getMockClinics());
        } else {
          setClinics(clinicsData || getMockClinics());
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setHealthCenter(getMockHealthCenter());
      setClinics(getMockClinics());
    } finally {
      setLoading(false);
    }
  };

  const getMockHealthCenter = (): HealthCenter => ({
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'مركز حدائق أكتوبر الطبي المتكامل',
    address: 'حدائق أكتوبر، شارع النيل، بجوار مول الأندلس، الحي السابع',
    phone: '01234567890',
    email: 'info@octobergardens-medical.com',
    working_hours: '24/7 - خدمة طوارئ متاحة',
    description: 'مركز طبي متكامل يقدم خدمات طبية شاملة لسكان حدائق أكتوبر مع أحدث التقنيات الطبية',
    image_url: '/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png',
    google_maps_url: 'https://maps.google.com/?q=30.0444,31.2357'
  });

  const getMockClinics = (): Clinic[] => [
    { id: '550e8400-e29b-41d4-a716-446655440001', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة الطب العام', doctor_name: 'د. أحمد محمد علي', specialization: 'طب عام', consultation_fee: 150, waiting_patients: 1, max_patients_per_day: 30, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440002', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة الأطفال', doctor_name: 'د. فاطمة عبد الرحمن', specialization: 'طب أطفال', consultation_fee: 200, waiting_patients: 1, max_patients_per_day: 25, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440003', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة النساء والتوليد', doctor_name: 'د. مريم حسن إبراهيم', specialization: 'نساء وتوليد', consultation_fee: 250, waiting_patients: 1, max_patients_per_day: 20, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440004', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة القلب والأوعية الدموية', doctor_name: 'د. خالد سعد الدين', specialization: 'قلب وأوعية دموية', consultation_fee: 300, waiting_patients: 1, max_patients_per_day: 15, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440005', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة العظام والمفاصل', doctor_name: 'د. عمر محمود أحمد', specialization: 'عظام ومفاصل', consultation_fee: 280, waiting_patients: 1, max_patients_per_day: 18, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440006', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة الأنف والأذن والحنجرة', doctor_name: 'د. نورا محمد حسن', specialization: 'أنف وأذن وحنجرة', consultation_fee: 220, waiting_patients: 0, max_patients_per_day: 22, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440007', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة العيون', doctor_name: 'د. يوسف عبد الله', specialization: 'عيون', consultation_fee: 200, waiting_patients: 0, max_patients_per_day: 25, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440008', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة الجلدية', doctor_name: 'د. سارة أحمد محمد', specialization: 'جلدية', consultation_fee: 180, waiting_patients: 0, max_patients_per_day: 28, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440009', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة الجهاز الهضمي', doctor_name: 'د. محمد علي حسن', specialization: 'جهاز هضمي', consultation_fee: 270, waiting_patients: 0, max_patients_per_day: 16, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440010', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة المسالك البولية', doctor_name: 'د. عائشة محمود إبراهيم', specialization: 'مسالك بولية', consultation_fee: 260, waiting_patients: 0, max_patients_per_day: 20, is_available: true },
    { id: '550e8400-e29b-41d4-a716-446655440011', health_center_id: '550e8400-e29b-41d4-a716-446655440000', name: 'عيادة الطب النفسي', doctor_name: 'د. عبد الرحمن سعد الدين', specialization: 'طب نفسي', consultation_fee: 320, waiting_patients: 0, max_patients_per_day: 12, is_available: true }
  ];

  const handleBookAppointment = (clinic: Clinic) => {
    navigate(`/book-appointment/${clinic.id}`);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleNavigate = (googleMapsUrl: string) => {
    window.open(googleMapsUrl, '_blank');
  };

  const getSpecializationColor = (specialization: string) => {
    const colors: { [key: string]: string } = {
      'طب عام': 'from-blue-500 to-blue-600',
      'طب أطفال': 'from-pink-500 to-pink-600',
      'نساء وتوليد': 'from-purple-500 to-purple-600',
      'أمراض القلب': 'from-red-500 to-red-600',
      'جراحة العظام': 'from-orange-500 to-orange-600',
      'أمراض جلدية': 'from-green-500 to-green-600',
      'أنف وأذن وحنجرة': 'from-teal-500 to-teal-600',
      'طب العيون': 'from-cyan-500 to-cyan-600',
      'طب الأسنان': 'from-indigo-500 to-indigo-600'
    };
    return colors[specialization] || 'from-gray-500 to-gray-600';
  };

  const getSpecializationIcon = (specialization: string) => {
    const icons: { [key: string]: string } = {
      'طب عام': '🩺',
      'طب أطفال': '👶',
      'نساء وتوليد': '👩',
      'أمراض القلب': '❤️',
      'جراحة العظام': '🦴',
      'أمراض جلدية': '🧴',
      'أنف وأذن وحنجرة': '👂',
      'طب العيون': '👁️',
      'طب الأسنان': '🦷'
    };
    return icons[specialization] || '🏥';
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

  if (!healthCenter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">المركز الصحي غير موجود</h3>
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
        {/* Health Center Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="overflow-hidden shadow-lg border-0">
            <div className="relative h-40 bg-gradient-to-r from-emerald-500 to-cyan-600">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              
              {/* Rating */}
              <div className="absolute bottom-4 right-4 text-white">
                <div className="flex items-center space-x-1 rtl:space-x-reverse bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star className="w-4 h-4 fill-current text-yellow-300" />
                  <span className="text-sm font-bold">4.8</span>
                </div>
              </div>
              
              {/* Center Icon */}
              <div className="absolute top-4 right-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <CardContent className="p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{healthCenter.name}</h2>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{healthCenter.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3 rtl:space-x-reverse text-sm text-gray-600">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="flex-1 leading-relaxed">{healthCenter.address}</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>{healthCenter.working_hours}</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600">
                  <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>{healthCenter.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="sm"
                  onClick={() => handleCall(healthCenter.phone)}
                  className="flex items-center justify-center space-x-2 rtl:space-x-reverse border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">اتصال</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNavigate(healthCenter.google_maps_url!)}
                  className="flex items-center justify-center space-x-2 rtl:space-x-reverse border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">الموقع</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Stethoscope className="w-8 h-8 mx-auto mb-2" />
              <div className="text-xl font-bold">{clinics.length}</div>
              <div className="text-sm opacity-90">عيادة متاحة</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <div className="text-xl font-bold">{clinics.reduce((sum, clinic) => sum + clinic.waiting_patients, 0)}</div>
              <div className="text-sm opacity-90">مرضى منتظرون</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="text-xl font-bold">{clinics.filter(c => c.is_available).length}</div>
              <div className="text-sm opacity-90">متاح للحجز</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clinics List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-4"
        >
          {clinics.map((clinic, index) => (
            <motion.div
              key={clinic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                <CardContent className="p-0">
                  {/* Header with specialization color */}
                  <div className={`relative h-32 bg-gradient-to-r ${getSpecializationColor(clinic.specialization)}`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    
                    {/* Specialization Icon */}
                    <div className="absolute top-4 left-4 text-white">
                      <div className="text-3xl">{getSpecializationIcon(clinic.specialization)}</div>
                    </div>
                    
                    {/* Waiting Patients */}
                    <div className="absolute bottom-4 right-4 text-white">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-bold">{clinic.waiting_patients}</span>
                      </div>
                    </div>
                    
                    {/* Specialization Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        {clinic.specialization}
                      </Badge>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="absolute bottom-4 left-4">
                      <div className={`w-3 h-3 rounded-full ${clinic.is_available ? 'bg-green-400' : 'bg-red-400'} shadow-lg`}></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{clinic.name}</h3>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                      <User className="w-5 h-5 text-emerald-600" />
                      <span className="text-gray-700 font-medium">{clinic.doctor_name}</span>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-emerald-800">{clinic.consultation_fee} ج.م</div>
                            <div className="text-sm text-emerald-600">رسوم الاستشارة</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-orange-800">{clinic.waiting_patients} شخص</div>
                            <div className="text-sm text-orange-600">في الانتظار</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleBookAppointment(clinic)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 rtl:space-x-reverse"
                    >
                      <Calendar className="w-6 h-6" />
                      <span>احجز موعد مع الدكتور</span>
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Clinics;
