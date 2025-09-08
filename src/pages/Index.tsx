import { Newspaper, Shield, Building, Briefcase, Handshake, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNewsNotifications } from "@/hooks/useNewsNotifications";
import { NewsNotificationBadge } from "@/components/NewsNotificationBadge";
import { LatestNewsSection } from "@/components/LatestNewsSection";
const Index = () => {
  const navigate = useNavigate();
  const {
    unreadCount
  } = useNewsNotifications();
  const navigationItems = [{
    title: "أخبار المدينة",
    description: "تابع آخر الأخبار والمستجدات في مدينتك",
    icon: Newspaper,
    onClick: () => navigate("/news"),
    badge: unreadCount > 0 ? <NewsNotificationBadge count={unreadCount} /> : undefined
  }, {
    title: "شرطة المدينة",
    description: "أرقام التواصل مع مركز الشرطة للطوارئ والخدمات",
    icon: Shield,
    onClick: () => navigate("/police")
  }, {
    title: "جهاز المدينة",
    description: "تواصل مع إدارات المدينة المختلفة",
    icon: Building,
    onClick: () => navigate("/city")
  }, {
    title: "خدمات المدينة",
    description: "خدمات ومرافق البلدية للمواطنين",
    icon: Wrench,
    onClick: () => navigate("/city-services")
  }, {
    title: "المال والأعمال",
    description: "استكشف الفرص التجارية في المدينة",
    icon: Handshake,
    onClick: () => navigate("/business")
  }];
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative mb-8">
            <img src="/lovable-uploads/687e6d95-f6ac-4274-b5cf-8969324550b0.png" alt="October Gardens city gate" className="w-full max-w-md mx-auto rounded-3xl shadow-elegant animate-float" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
          </div>
          
          <h3 className="md:text-3xl font-bold text-foreground mb-6 animate-slide-up text-xl">حدائق أكتوبر أونلاين</h3>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 max-w-4xl mx-auto px-2 md:px-4">
          {navigationItems.map((item, index) => <NavigationCard key={item.title} title={item.title} description={item.description} icon={item.icon} onClick={item.onClick} badge={item.badge} className="animate-slide-up" style={{
          animationDelay: `${0.6 + index * 0.1}s`
        }} />)}
        </div>

        {/* Latest News Section */}
        <LatestNewsSection />
      </div>
    </div>;
};
export default Index;