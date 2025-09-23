import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
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
  Navigation
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
        .from('health_centers')
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
      id: '1',
      name: 'مركز حدائق أكتوبر الطبي',
      address: 'حدائق أكتوبر، شارع النيل، بجوار مول الأندلس',
      phone: '01234567890',
      email: 'info@octobergardens-medical.com',
      working_hours: '24/7 - خدمة طوارئ متاحة',
      services: ['طب عام', 'طوارئ', 'أشعة', 'تحاليل', 'صيدلية'],
      rating: 4.8,
      image_url: '/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png',
      description: 'مركز طبي متكامل يقدم خدمات طبية شاملة لسكان حدائق أكتوبر',
      latitude: 30.0444,
      longitude: 31.2357,
      google_maps_url: 'https://maps.google.com/?q=30.0444,31.2357',
      is_available: true,
      specializations: ['طب عام', 'طوارئ', 'أطفال', 'نساء وتوليد']
    },
    {
      id: '2',
      name: 'عيادة النخيل التخصصية',
      address: 'حدائق أكتوبر، الحي السابع، شارع النخيل',
      phone: '01234567891',
      email: 'info@nakhil-clinic.com',
      working_hours: '8:00 ص - 10:00 م',
      services: ['طب أسنان', 'جلدية', 'عيون', 'أنف وأذن وحنجرة'],
      rating: 4.6,
      image_url: '/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png',
      description: 'عيادة متخصصة في طب الأسنان والجلدية والعيون',
      latitude: 30.0444,
      longitude: 31.2357,
      google_maps_url: 'https://maps.google.com/?q=30.0444,31.2357',
      is_available: true,
      specializations: ['طب أسنان', 'جلدية', 'عيون']
    },
    {
      id: '3',
      name: 'مستشفى الأندلس',
      address: 'حدائق أكتوبر، بجوار مول الأندلس',
      phone: '01234567892',
      email: 'info@andalus-hospital.com',
      working_hours: '24/7',
      services: ['جراحة', 'عناية مركزة', 'ولادة', 'أطفال', 'قلب'],
      rating: 4.9,
      image_url: '/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png',
      description: 'مستشفى متكامل يقدم خدمات طبية متقدمة وجراحية',
      latitude: 30.0444,
      longitude: 31.2357,
      google_maps_url: 'https://maps.google.com/?q=30.0444,31.2357',
      is_available: true,
      specializations: ['جراحة عامة', 'قلب', 'نساء وتوليد', 'أطفال']
    },
    {
      id: '4',
      name: 'مركز الصحة النفسية',
      address: 'حدائق أكتوبر، الحي الثالث، شارع السلام',
      phone: '01234567893',
      email: 'info@mental-health-center.com',
      working_hours: '9:00 ص - 6:00 م',
      services: ['طب نفسي', 'استشارات نفسية', 'علاج سلوكي'],
      rating: 4.7,
      image_url: '/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png',
      description: 'مركز متخصص في الصحة النفسية والاستشارات النفسية',
      latitude: 30.0444,
      longitude: 31.2357,
      google_maps_url: 'https://maps.google.com/?q=30.0444,31.2357',
      is_available: true,
      specializations: ['طب نفسي', 'استشارات نفسية']
    }
  ];

  const handleBookAppointment = (center: HealthCenter) => {
    // هنا يمكن إضافة منطق الحجز
    alert(`سيتم توجيهك لحجز موعد في ${center.name}`);
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
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </Button>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Heart className="w-6 h-6 text-green-600" />
            <h1 className="text-lg font-bold text-gray-800">المراكز الصحية</h1>
          </div>
          <div className="w-16"></div>
        </div>
      </motion.div>

      <div className="px-4 py-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4 text-center">
              <Stethoscope className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{healthCenters.length}</div>
              <div className="text-sm opacity-90">مركز صحي</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm opacity-90">خدمة طوارئ</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Centers List */}
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
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  {/* Header with image */}
                  <div className="relative h-32 bg-gradient-to-r from-green-500 to-emerald-600">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-4 right-4 text-white">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">{center.rating}</span>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge 
                        variant={center.is_available ? "default" : "secondary"}
                        className={center.is_available ? "bg-green-500" : "bg-gray-500"}
                      >
                        {center.is_available ? "متاح" : "غير متاح"}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{center.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{center.description}</p>

                    {/* Services */}
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-700 mb-2">الخدمات:</div>
                      <div className="flex flex-wrap gap-1">
                        {center.services.slice(0, 3).map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {center.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{center.services.length - 3} أخرى
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="flex-1">{center.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{center.working_hours}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCall(center.phone)}
                        className="flex items-center space-x-1 rtl:space-x-reverse bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-xs">اتصال</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookAppointment(center)}
                        className="flex items-center space-x-1 rtl:space-x-reverse"
                      >
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">حجز</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNavigate(center.google_maps_url!)}
                        className="flex items-center space-x-1 rtl:space-x-reverse"
                      >
                        <Navigation className="w-4 h-4" />
                        <span className="text-xs">خريطة</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

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
