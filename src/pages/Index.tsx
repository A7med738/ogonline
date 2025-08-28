import { Newspaper, Shield, Building, User, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import cityHeroImage from "@/assets/city-hero.jpg";
import { useNewsNotifications } from "@/hooks/useNewsNotifications";
import { NewsNotificationBadge } from "@/components/NewsNotificationBadge";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { unreadCount } = useNewsNotifications();

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data);
    } catch (error) {
      // User is not admin
      setIsAdmin(false);
    }
  };
  
  const navigationItems = [{
    title: "أخبار المدينة",
    description: "تابع آخر الأخبار والمستجدات في مدينتك",
    icon: Newspaper,
    onClick: () => navigate("/news"),
    badge: unreadCount > 0 ? <NewsNotificationBadge count={unreadCount} /> : undefined
  }, {
    title: "أرقام الشرطة",
    description: "أرقام التواصل مع مركز الشرطة للطوارئ والخدمات",
    icon: Shield,
    onClick: () => navigate("/police")
  }, {
    title: "جهاز المدينة",
    description: "تواصل مع إدارات المدينة المختلفة",
    icon: Building,
    onClick: () => navigate("/city")
  }];
  
  return <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        
        {/* Auth Section */}
        <div className="absolute top-4 left-4 z-50">
          {user ? (
            <div className="flex space-x-2 space-x-reverse">
              {isAdmin && (
                <Button 
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="bg-red-500/20 backdrop-blur-sm border-red-400/30 text-white hover:bg-red-500/30 shadow-lg"
                >
                  <Settings className="ml-2 h-4 w-4" />
                  لوحة الإدارة
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => navigate('/profile')}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 shadow-lg"
              >
                <User className="ml-2 h-4 w-4" />
                الملف الشخصي
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 shadow-lg"
            >
              <User className="ml-2 h-4 w-4" />
              تسجيل الدخول
            </Button>
          )}
        </div>
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative mb-8">
            <img src={cityHeroImage} alt="City skyline" className="w-full max-w-md mx-auto rounded-3xl shadow-elegant animate-float" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
          </div>
          
          <h1 className="md:text-6xl font-bold text-white mb-6 animate-slide-up text-3xl">مركز مدينة حدائق أكتوبر</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-up" style={{
          animationDelay: '0.2s'
        }}>
            بوابتك للخدمات والأخبار والتواصل
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto animate-scale-in" style={{
          animationDelay: '0.4s'
        }}>
            <p className="text-white/80 text-sm">
              تطبيق شامل لخدمات المدينة والتواصل مع الجهات المختصة
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-8 max-w-4xl mx-auto sm:grid-cols-2 lg:grid-cols-3">
          {navigationItems.map((item, index) => <NavigationCard 
            key={item.title} 
            title={item.title} 
            description={item.description} 
            icon={item.icon} 
            onClick={item.onClick} 
            badge={item.badge}
            className="animate-slide-up" 
            style={{
              animationDelay: `${0.6 + index * 0.1}s`
            }} 
          />)}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 animate-fade-in" style={{
        animationDelay: '1s'
      }}>
          <p className="text-white/70 text-sm">• متاح على مدار الساعة</p>
        </div>
      </div>
    </div>;
};
export default Index;