import { Newspaper, Shield, Building, Briefcase, Handshake, Wrench, Home, Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Card, CardContent } from "@/components/ui/card";
import { useNewsNotifications } from "@/hooks/useNewsNotifications";
import { NewsNotificationBadge } from "@/components/NewsNotificationBadge";
import { LatestNewsSection } from "@/components/LatestNewsSection";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
const Index = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNewsNotifications();

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
    {
      id: "city",
      title: "جهاز المدينة",
      description: "تواصل مع إدارات المدينة المختلفة",
      icon: Building,
      color: "from-blue-500 to-cyan-500",
      onClick: () => navigate("/city")
    },
    {
      id: "police",
      title: "شرطة المدينة",
      description: "أرقام التواصل مع مركز الشرطة للطوارئ والخدمات",
      icon: Shield,
      color: "from-red-500 to-pink-500",
      onClick: () => navigate("/police")
    },
    {
      id: "news",
      title: "أخبار المدينة",
      description: "تابع آخر الأخبار والمستجدات في مدينتك",
      icon: Newspaper,
      color: "from-green-500 to-emerald-500",
      onClick: () => navigate("/news"),
      badge: unreadCount > 0 ? <NewsNotificationBadge count={unreadCount} /> : undefined
    },
    {
      id: "business",
      title: "المال والأعمال",
      description: "استكشف الفرص التجارية في المدينة",
      icon: Handshake,
      color: "from-yellow-500 to-orange-500",
      onClick: () => navigate("/business")
    },
    {
      id: "services",
      title: "خدمات المدينة",
      description: "خدمات ومرافق البلدية للمواطنين",
      icon: Wrench,
      color: "from-purple-500 to-indigo-500",
      onClick: () => navigate("/city-services")
    },
    {
      id: "real-estate",
      title: "عقارات المدينة",
      description: "ابحث عن العقارات المتاحة للبيع والإيجار",
      icon: Home,
      color: "from-emerald-500 to-teal-500",
      onClick: () => navigate("/real-estate")
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">

      <div className="px-4 py-6">
        {/* Hero Section - Mobile Optimized */}
        <motion.div 
          variants={heroVariants}
          initial="hidden"
          animate="visible"
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
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2"
          >
            حدائق أكتوبر أونلاين
          </motion.h1>
          

        </motion.div>

        {/* Services Grid - Mobile Optimized */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div 
            variants={itemVariants}
            className="text-center mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">خدمات المدينة</h2>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4"
          >
            {navigationItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                  onClick={item.onClick}
                >
                  <Card className={cn(
                    "relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group",
                    `bg-gradient-to-br ${item.color}`
                  )}>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                      >
                        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </motion.div>
                      <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight">
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
              );
            })}
          </motion.div>
        </motion.div>

        {/* Latest News Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <LatestNewsSection />
        </motion.div>
      </div>
    </div>
  );
};
export default Index;