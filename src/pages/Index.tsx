import { Newspaper, Shield, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import cityHeroImage from "@/assets/city-hero.jpg";
const Index = () => {
  const navigate = useNavigate();
  const navigationItems = [{
    title: "أخبار المدينة",
    description: "تابع آخر الأخبار والمستجدات في مدينتك",
    icon: Newspaper,
    onClick: () => navigate("/news")
  }, {
    title: "أرقام الشرطة",
    description: "أرقام التواصل مع مركز الشرطة للطوارئ والخدمات",
    icon: Shield,
    onClick: () => navigate("/police")
  }, {
    title: "هيئة المدينة",
    description: "تواصل مع إدارات المدينة المختلفة",
    icon: Building,
    onClick: () => navigate("/city")
  }];
  return <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative mb-8">
            <img src={cityHeroImage} alt="City skyline" className="w-full max-w-md mx-auto rounded-3xl shadow-elegant animate-float" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-slide-up">مركز مدينة 
حدائق أكتوبر</h1>
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
        <div className="grid gap-6 max-w-2xl mx-auto">
          {navigationItems.map((item, index) => <NavigationCard key={item.title} title={item.title} description={item.description} icon={item.icon} onClick={item.onClick} className="animate-slide-up" style={{
          animationDelay: `${0.6 + index * 0.1}s`
        }} />)}
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