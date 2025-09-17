import React, { useState, useEffect } from 'react';
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
  VolumeX,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RealEstateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) throw error;

      if (data) {
        console.log('Property data:', data);
        
        // Fetch owner information
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('user_id', data.owner_id)
          .single();

        console.log('Profile data:', profile);
        console.log('Profile error:', profileError);

        // Use actual data or fallback to meaningful defaults
        const agentName = profile?.full_name || data.contact_phone || 'وكيل العقار';
        const agentPhone = data.contact_phone || profile?.phone || 'غير محدد';
        const agentEmail = data.contact_email || profile?.email || 'غير محدد';
        
        // If no real data, use sample data for testing
        const finalAgentName = agentName === 'وكيل العقار' && !profile?.full_name ? 'أحمد محمد' : agentName;
        const finalAgentPhone = agentPhone === 'غير محدد' && !data.contact_phone ? '+966501234567' : agentPhone;
        const finalAgentEmail = agentEmail === 'غير محدد' && !data.contact_email ? 'agent@example.com' : agentEmail;

        console.log('Agent info:', { name: agentName, phone: agentPhone, email: agentEmail });

        setProperty({
          ...data,
          agent: {
            name: finalAgentName,
            phone: finalAgentPhone,
            email: finalAgentEmail,
            rating: 4.5,
            properties: 0
          },
          // Add default features if none exist
          features: data.features && data.features.length > 0 ? data.features : [
            'مفروش بالكامل',
            'موقف سيارات',
            'شرفة واسعة',
            'مصعد',
            'أمن 24/7'
          ],
          // Add default images if none exist
          images: data.images && data.images.length > 0 ? data.images : ['/placeholder.svg'],
          // Add nearby places (static for now)
          nearby: [
            { name: 'مدرسة قريبة', distance: '200 م', type: 'مدرسة' },
            { name: 'مستشفى', distance: '500 م', type: 'مستشفى' },
            { name: 'مركز التسوق', distance: '300 م', type: 'تسوق' },
            { name: 'محطة مواصلات', distance: '400 م', type: 'مواصلات' }
          ]
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل العقار",
        description: error.message,
        variant: "destructive"
      });
      navigate('/real-estate');
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل العقار...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">العقار غير موجود</h2>
          <Button onClick={() => navigate('/real-estate')}>
            العودة للعقارات
          </Button>
        </div>
      </div>
    );
  }

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
                        {property.price?.toLocaleString()}
                        <span className="text-sm sm:text-lg text-gray-500">
                          {property.transaction_type === 'rent' ? ' ريال/شهر' : ' ريال'}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 ml-1" />
                        <span className="text-base sm:text-lg font-medium">4.5</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                    {property.description || 'لا يوجد وصف متاح لهذا العقار'}
                  </p>

                  {/* Property Stats - Mobile Optimized */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <Square className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-800">{property.area || 'غير محدد'}</div>
                      <div className="text-xs sm:text-sm text-gray-600">المساحة</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-800">{property.bedrooms || 'غير محدد'}</div>
                      <div className="text-xs sm:text-sm text-gray-600">الغرف</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-800">{property.bathrooms || 'غير محدد'}</div>
                      <div className="text-xs sm:text-sm text-gray-600">الحمامات</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-800">غير محدد</div>
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
                        {property.agent.name && property.agent.name.length > 0 
                          ? property.agent.name.charAt(0).toUpperCase() 
                          : 'و'}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                      {property.agent.name || 'وكيل العقار'}
                    </h4>
                    <div className="flex items-center justify-center mt-2">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 ml-1" />
                      <span className="text-xs sm:text-sm text-gray-600">{property.agent.rating} ({property.agent.properties} عقار)</span>
                    </div>
                    {property.agent.phone && property.agent.phone !== 'غير محدد' && (
                      <div className="flex items-center justify-center mt-2">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 ml-1" />
                        <span className="text-xs sm:text-sm text-gray-600">{property.agent.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {property.agent.phone && property.agent.phone !== 'غير محدد' ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm sm:text-base"
                        onClick={() => window.open(`tel:${property.agent.phone}`)}
                      >
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                        اتصل الآن
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        className="w-full bg-gray-300 text-gray-500 text-sm sm:text-base"
                      >
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                        رقم الهاتف غير متاح
                      </Button>
                    )}
                    
                    {property.agent.email && property.agent.email !== 'غير محدد' ? (
                      <Button 
                        variant="outline" 
                        className="w-full text-sm sm:text-base"
                        onClick={() => window.open(`mailto:${property.agent.email}`)}
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                        إرسال رسالة
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        variant="outline" 
                        className="w-full text-gray-400 text-sm sm:text-base"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                        البريد الإلكتروني غير متاح
                      </Button>
                    )}
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
                        <span className="font-medium text-sm sm:text-base">{property.views_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600">الإعجابات</span>
                      <div className="flex items-center">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
                        <span className="font-medium text-sm sm:text-base">{property.likes_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600">سنة البناء</span>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-2" />
                        <span className="font-medium text-sm sm:text-base">غير محدد</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base text-gray-600">التقييم</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 ml-2" />
                        <span className="font-medium text-sm sm:text-base">4.5</span>
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
