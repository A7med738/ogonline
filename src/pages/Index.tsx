import { Newspaper, Shield, Building, Briefcase, Handshake, Wrench, Home, Star, TrendingUp, GraduationCap, Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Card, CardContent } from "@/components/ui/card";
import { useNewsNotifications } from "@/hooks/useNewsNotifications";
import { NewsNotificationBadge } from "@/components/NewsNotificationBadge";
import { LatestNewsSection } from "@/components/LatestNewsSection";
import VisitorStats from "@/components/VisitorStats";
import ProtectedNavItem from "@/components/ProtectedNavItem";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
const Index = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNewsNotifications();
  const { user } = useAuth();

  // Animation variants
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const searchVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  const navigationItems = [
    // الصف الأول
    {
      id: "news",
      title: "أخبار المدينة",
      description: "تابع آخر الأخبار والمستجدات في مدينتك",
      icon: Newspaper,
      color: "from-white to-white",
      onClick: () => navigate("/news"),
      badge: unreadCount > 0 ? <NewsNotificationBadge count={unreadCount} /> : undefined,
      requiresAuth: false
    },
    {
      id: "city",
      title: "جهاز المدينة",
      description: "تواصل مع إدارات المدينة المختلفة",
      icon: Building,
      color: "from-white to-white",
      onClick: () => navigate("/city"),
      requiresAuth: true
    },
    {
      id: "police",
      title: "شرطة المدينة",
      description: "أرقام التواصل مع مركز الشرطة للطوارئ والخدمات",
      icon: Shield,
      color: "from-white to-white",
      onClick: () => navigate("/police"),
      requiresAuth: false
    },
    // الصف الثاني
    {
      id: "city-malls",
      title: "مولات المدينة",
      description: "مولات ومراكز تسوق في المدينة",
      icon: ShoppingBag,
      color: "from-white to-white",
      onClick: () => navigate("/city-malls"),
      requiresAuth: true
    },
    {
      id: "services",
      title: "خدمات المدينة",
      description: "خدمات ومرافق البلدية للمواطنين",
      icon: Wrench,
      color: "from-white to-white",
      onClick: () => navigate("/city-services"),
      requiresAuth: true
    },
    {
      id: "educational-services",
      title: "خدمات تعليمية",
      description: "خدمات تعليمية ومدارس في المدينة",
      icon: GraduationCap,
      color: "from-white to-white",
      onClick: () => navigate("/educational-services"),
      requiresAuth: true
    },
    // الصف الثالث
    {
      id: "medical-services",
      title: "خدمات طبية",
      description: "مستشفيات ومراكز طبية في المدينة",
      icon: Heart,
      color: "from-white to-white",
      onClick: () => navigate("/medical-services"),
      requiresAuth: true
    },
    {
      id: "business",
      title: "المال والأعمال",
      description: "استكشف الفرص التجارية في المدينة",
      icon: Handshake,
      color: "from-white to-white",
      onClick: () => navigate("/business"),
      requiresAuth: true
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="px-4">
        {/* Hero Section - Mobile Optimized */}

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="relative mb-6 sm:mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl"
            >
              <img 
                src="/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png" 
                alt="October Gardens city gate" 
                className="w-full max-w-sm sm:max-w-md mx-auto rounded-2xl sm:rounded-3xl" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl sm:rounded-3xl"></div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Star className="w-4 h-4 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <TrendingUp className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2"
          >
          </motion.h1>
          

        </motion.div>

        {/* خدمة احجزلي - Mobile Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <div 
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg mx-2 sm:mx-0 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/book-service')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-700/20"></div>
            <div className="relative px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="text-white text-lg sm:text-xl"
                  >
                    📱
                  </motion.div>
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold text-sm sm:text-base leading-tight">
                    خدمة احجزلي
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm">
                    احجز خدماتك بسهولة
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-white text-lg sm:text-xl"
                  >
                    ✨
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            {/* Floating particles effect */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 right-4 w-2 h-2 bg-white/30 rounded-full"
            ></motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-2 left-4 w-1.5 h-1.5 bg-white/40 rounded-full"
            ></motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 right-8 w-1 h-1 bg-white/50 rounded-full"
            ></motion.div>
          </div>
        </motion.div>

        {/* Services Grid - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="mb-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800"></h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4"
          >
            {navigationItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <ProtectedNavItem
                  key={item.id}
                  onClick={item.onClick}
                  showLockIcon={item.requiresAuth}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer"
                  >
                  <Card className={cn(
                    "relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group",
                    `bg-gradient-to-br ${item.color}`
                  )}>
                    <CardContent className="p-2 sm:p-3 text-center">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 bg-white rounded-lg flex items-center justify-center flex-shrink-0"
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 flex-shrink-0" />
                      </motion.div>
                      <h3 className="text-black font-semibold text-xs leading-tight">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <div className="absolute top-1 right-1">
                          {item.badge}
                        </div>
                      )}
                      
                      {/* Hover effect */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            →
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                  </motion.div>
                </ProtectedNavItem>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Latest News Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <LatestNewsSection />
        </motion.div>

        {/* Visitor Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mt-8 sm:mt-12"
        >
          <VisitorStats />
        </motion.div>

        {/* مساحة إضافية لتجنب تغطية الزر العائم */}
        <div className="h-20 sm:h-24"></div>
      </div>
    </div>
  );
};
export default Index;