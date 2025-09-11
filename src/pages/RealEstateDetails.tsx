import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Star, 
  MapPin, 
  Square, 
  Bed, 
  Bath, 
  Car,
  Calendar,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const RealEstateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Mock data - in real app, fetch from API
  const property = {
    id: id || '1',
    title: 'شقة فاخرة في قلب المدينة',
    type: 'sale',
    price: '2,500,000',
    location: 'الرياض، حي النخيل',
    area: '150 متر مربع',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    yearBuilt: 2020,
    furnished: true,
    rating: 4.8,
    views: 1250,
    likes: 89,
    description: 'شقة فاخرة في موقع مميز مع إطلالة رائعة على المدينة. تتميز بمساحات واسعة وتصميم عصري مع جميع المرافق الحديثة.',
    features: [
      'مفروش بالكامل',
      'موقف سيارات',
      'شرفة واسعة',
      'مصعد',
      'أمن 24/7',
      'صالة رياضية',
      'مسبح',
      'حديقة'
    ],
    images: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    agent: {
      name: 'أحمد محمد',
      phone: '+966501234567',
      email: 'ahmed@realestate.com',
      rating: 4.9,
      properties: 156
    },
    nearby: [
      { name: 'مدرسة النخيل', distance: '200 م', type: 'مدرسة' },
      { name: 'مستشفى الملك فهد', distance: '500 م', type: 'مستشفى' },
      { name: 'مركز التسوق', distance: '300 م', type: 'تسوق' },
      { name: 'محطة مترو', distance: '400 م', type: 'مواصلات' }
    ]
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>العودة</span>
            </Button>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "transition-colors",
                  isLiked ? "text-red-500" : "text-gray-600"
                )}
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-gray-600"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery - Mobile Optimized */}
            <motion.div variants={itemVariants} className="relative">
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className="relative aspect-video sm:aspect-video bg-gradient-to-br from-gray-200 to-gray-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-2xl">
                        {property.title.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Image Navigation - Mobile Optimized */}
                  <div className="absolute inset-0 flex items-center justify-between p-2 sm:p-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={prevImage}
                      className="bg-white/80 backdrop-blur-sm hover:bg-white/90 w-8 h-8 sm:w-10 sm:h-10 p-0"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={nextImage}
                      className="bg-white/80 backdrop-blur-sm hover:bg-white/90 w-8 h-8 sm:w-10 sm:h-10 p-0"
                    >
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  {/* Image Indicators - Mobile Optimized */}
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 rtl:space-x-reverse">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all",
                          index === currentImageIndex 
                            ? "bg-white w-6 sm:w-8" 
                            : "bg-white/50"
                        )}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Property Info - Mobile Optimized */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        {property.title}
                      </h1>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 ml-2 flex-shrink-0" />
                        <span className="text-base sm:text-lg">{property.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">
                        {property.price}
                        <span className="text-sm sm:text-lg text-gray-500">
                          {property.type === 'rent' ? ' ريال/شهر' : ' ريال'}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 ml-1" />
                        <span className="text-base sm:text-lg font-medium">{property.rating}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                    {property.description}
                  </p>

                  {/* Property Stats - Mobile Optimized */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <Square className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-800">{property.area}</div>
                      <div className="text-xs sm:text-sm text-gray-600">المساحة</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-800">{property.bedrooms}</div>
                      <div className="text-xs sm:text-sm text-gray-600">الغرف</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-800">{property.bathrooms}</div>
                      <div className="text-xs sm:text-sm text-gray-600">الحمامات</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-800">{property.parking}</div>
                      <div className="text-xs sm:text-sm text-gray-600">المواقف</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">المميزات</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-emerald-50 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Nearby Places */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">الأماكن القريبة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.nearby.map((place, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-gray-800">{place.name}</div>
                          <div className="text-sm text-gray-600">{place.type}</div>
                        </div>
                        <div className="text-emerald-600 font-medium">{place.distance}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-6">
            {/* Contact Agent - Mobile Optimized */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">تواصل مع الوكيل</h3>
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <span className="text-white font-bold text-lg sm:text-2xl">
                        {property.agent.name.charAt(0)}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">{property.agent.name}</h4>
                    <div className="flex items-center justify-center mt-2">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 ml-1" />
                      <span className="text-xs sm:text-sm text-gray-600">{property.agent.rating} ({property.agent.properties} عقار)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm sm:text-base"
                      onClick={() => window.open(`tel:${property.agent.phone}`)}
                    >
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      اتصل الآن
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-sm sm:text-base"
                      onClick={() => window.open(`mailto:${property.agent.email}`)}
                    >
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      إرسال رسالة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Property Stats - Mobile Optimized */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">إحصائيات العقار</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600">المشاهدات</span>
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
                        <span className="font-medium text-sm sm:text-base">{property.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600">الإعجابات</span>
                      <div className="flex items-center">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
                        <span className="font-medium text-sm sm:text-base">{property.likes}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600">سنة البناء</span>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
                        <span className="font-medium text-sm sm:text-base">{property.yearBuilt}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600">التقييم</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 ml-2" />
                        <span className="font-medium text-sm sm:text-base">{property.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RealEstateDetails;
