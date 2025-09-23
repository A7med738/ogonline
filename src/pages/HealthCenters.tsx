import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ArrowLeft,
  Heart,
  Stethoscope,
  Users,
  Calendar,
  Navigation,
  Building2,
  Activity,
  ChevronRight,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface HealthCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  working_hours: string;
  services: string[];
  rating: number;
  image_url?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  is_available: boolean;
  specializations: string[];
}

const HealthCenters = () => {
  const navigate = useNavigate();
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<HealthCenter | null>(null);

  useEffect(() => {
    fetchHealthCenters();
  }, []);

  const fetchHealthCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('book_service_health_centers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching health centers:', error);
        // بيانات تجريبية في حالة عدم وجود البيانات
        setHealthCenters(getMockData());
      } else {
        setHealthCenters(data || getMockData());
      }
    } catch (error) {
      console.error('Error:', error);
      setHealthCenters(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): HealthCenter[] => [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'مركز حدائق أكتوبر الطبي المتكامل - احجزلي',
      address: 'حدائق أكتوبر، شارع النيل، بجوار مول الأندلس، الحي السابع، الجيزة',
      phone: '01234567890',
      email: 'info@octobergardens-medical.com',
      working_hours: '24/7 - خدمة طوارئ متاحة',
      services: ['طب عام', 'أطفال', 'نساء وتوليد', 'قلب', 'عظام', 'جلدية', 'أنف وأذن وحنجرة', 'عيون', 'أسنان'],
      rating: 4.8,
      image_url: '/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png',
      description: 'مركز طبي متكامل يقدم خدمات طبية شاملة لسكان حدائق أكتوبر مع أحدث التقنيات الطبية - خدمة احجزلي',
      latitude: 30.0444,
      longitude: 31.2357,
      google_maps_url: 'https://maps.google.com/?q=30.0444,31.2357',
      is_available: true,
      specializations: ['طب عام', 'أطفال', 'نساء وتوليد', 'قلب', 'عظام', 'جلدية', 'أنف وأذن وحنجرة', 'عيون', 'أسنان']
    }
  ];

  const handleBookAppointment = (center: HealthCenter) => {
    navigate(`/clinics/${center.id}`);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleNavigate = (googleMapsUrl: string) => {
    window.open(googleMapsUrl, '_blank');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">

      <div className="px-4 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl p-6 text-white mb-6">
            <Building2 className="w-12 h-12 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">خدمة احجزلي الطبية</h2>
            <p className="text-sm opacity-90">احجز موعدك الطبي بسهولة واطمئن على صحتك</p>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{healthCenters.length}</div>
              <div className="text-sm opacity-90">مركز صحي متاح</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">11</div>
              <div className="text-sm opacity-90">عيادة متخصصة</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Centers List */}
        {healthCenters.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
          >
            {healthCenters.map((center, index) => (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                  <CardContent className="p-0">
                    {/* Header with image */}
                    <div className="relative h-40 bg-gradient-to-r from-emerald-500 to-cyan-600">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      
                      {/* Rating */}
                      <div className="absolute bottom-4 right-4 text-white">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <Star className="w-4 h-4 fill-current text-yellow-300" />
                          <span className="text-sm font-bold">{center.rating}</span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge 
                          variant={center.is_available ? "default" : "secondary"}
                          className={center.is_available ? "bg-emerald-500 text-white border-0" : "bg-gray-500 text-white border-0"}
                        >
                          {center.is_available ? "متاح للحجز" : "غير متاح"}
                        </Badge>
                      </div>
                      
                      {/* Center Icon */}
                      <div className="absolute top-4 right-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{center.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{center.description}</p>

                      {/* Services */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                          <Stethoscope className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-bold text-gray-700">العيادات المتاحة:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(center.services || []).slice(0, 4).map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                              {service}
                            </Badge>
                          ))}
                          {(center.services || []).length > 4 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                              +{(center.services || []).length - 4} أخرى
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-start space-x-3 rtl:space-x-reverse text-sm text-gray-600">
                          <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="flex-1 leading-relaxed">{center.address}</span>
                        </div>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600">
                          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <span>{center.working_hours}</span>
                        </div>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm text-gray-600">
                          <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span>{center.phone}</span>
                        </div>
                      </div>

                      {/* Main Action Button */}
                      <div className="space-y-3">
                        <Button
                          onClick={() => handleBookAppointment(center)}
                          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <Calendar className="w-5 h-5 ml-2 rtl:mr-2" />
                          عرض العيادات وحجز موعد
                          <ChevronRight className="w-4 h-4 mr-2 rtl:ml-2" />
                        </Button>
                        
                        {/* Secondary Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCall(center.phone)}
                            className="flex items-center justify-center space-x-2 rtl:space-x-reverse border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">اتصال</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNavigate(center.google_maps_url!)}
                            className="flex items-center justify-center space-x-2 rtl:space-x-reverse border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-sm">الموقع</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Card className="bg-gradient-to-r from-gray-100 to-gray-200">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🏥</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد مراكز صحية متاحة حالياً</h3>
                <p className="text-gray-600 mb-4">
                  نعمل على إضافة المراكز الصحية المتعاقد معها قريباً
                </p>
                <div className="text-sm text-gray-500">
                  سيتم إشعارك عند توفر المراكز الصحية الجديدة
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-bold mb-2">قريباً جداً!</h3>
              <p className="text-sm opacity-90">
                سنتعاقد مع المزيد من المراكز الصحية لتقديم أفضل الخدمات الطبية لسكان حدائق أكتوبر
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default HealthCenters;
