import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Heart,
  Stethoscope,
  Calendar,
  Clock,
  Star,
  Phone,
  MapPin,
  Users,
  Shield,
  Car,
  Home,
  GraduationCap,
  ShoppingBag,
  Wrench,
  Building,
  Briefcase,
  Handshake
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  isAvailable: boolean;
  route?: string;
}

const BookService = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const serviceCategories: ServiceCategory[] = [
    {
      id: 'health',
      title: 'المراكز الصحية',
      description: 'احجز مواعيدك الطبية في أفضل المراكز الصحية',
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      isAvailable: true,
      route: '/health-centers'
    },
    {
      id: 'education',
      title: 'الخدمات التعليمية',
      description: 'مدارس وجامعات ومعاهد تعليمية',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-600',
      isAvailable: false
    },
    {
      id: 'transport',
      title: 'خدمات النقل',
      description: 'حجز وسائل النقل والمواصلات',
      icon: Car,
      color: 'from-green-500 to-emerald-600',
      isAvailable: false
    },
    {
      id: 'shopping',
      title: 'التسوق',
      description: 'حجز في المولات والمتاجر',
      icon: ShoppingBag,
      color: 'from-orange-500 to-red-600',
      isAvailable: false
    },
    {
      id: 'services',
      title: 'خدمات المدينة',
      description: 'حجز خدمات البلدية والمرافق',
      icon: Wrench,
      color: 'from-teal-500 to-green-600',
      isAvailable: false
    },
    {
      id: 'business',
      title: 'الأعمال',
      description: 'حجز اجتماعات وخدمات تجارية',
      icon: Briefcase,
      color: 'from-indigo-500 to-blue-600',
      isAvailable: false
    },
    {
      id: 'security',
      title: 'الأمن',
      description: 'خدمات الأمن والشرطة',
      icon: Shield,
      color: 'from-gray-500 to-slate-600',
      isAvailable: false
    },
    {
      id: 'government',
      title: 'الجهات الحكومية',
      description: 'حجز مواعيد في الدوائر الحكومية',
      icon: Building,
      color: 'from-yellow-500 to-orange-600',
      isAvailable: false
    }
  ];

  const handleServiceClick = (service: ServiceCategory) => {
    if (service.isAvailable && service.route) {
      navigate(service.route);
    } else {
      // عرض رسالة "قريباً"
      alert(`${service.title} - قريباً جداً!`);
    }
  };

  const availableServices = serviceCategories.filter(s => s.isAvailable).length;
  const totalServices = serviceCategories.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">

      <div className="px-4 py-6">

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            اختر الخدمة التي تريد حجزها
          </h3>

          {serviceCategories.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`overflow-hidden shadow-lg transition-all duration-300 ${
                    service.isAvailable 
                      ? 'cursor-pointer hover:shadow-xl hover:scale-105' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => handleServiceClick(service)}
                >
                  <CardContent className="p-0">
                    {/* Header with gradient */}
                    <div className={`relative h-20 bg-gradient-to-r ${service.color}`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute top-4 right-4">
                        {service.isAvailable ? (
                          <Badge className="bg-green-500 text-white">
                            متاح
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-500">
                            قريباً
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">
                        {service.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {service.description}
                      </p>

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant={service.isAvailable ? "default" : "outline"}
                          disabled={!service.isAvailable}
                          className={`${
                            service.isAvailable 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-gray-300'
                          }`}
                        >
                          {service.isAvailable ? 'احجز الآن' : 'قريباً'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
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
              <h3 className="text-lg font-bold mb-2">المزيد من الخدمات قريباً!</h3>
              <p className="text-sm opacity-90">
                نعمل على إضافة المزيد من الخدمات لتسهيل حياتك في حدائق أكتوبر
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

export default BookService;
