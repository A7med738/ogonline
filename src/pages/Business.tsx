import { Briefcase, MapPin, Gift, ShoppingBag, Users, Building2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
const Business = () => {
  const navigate = useNavigate();
  const businessItems = [{
    title: "وظائف وفرص",
    description: "ابحث عن الوظائف والفرص الوظيفية المتاحة في المدينة",
    icon: Briefcase,
    onClick: () => navigate("/jobs"),
    // Will be implemented later
    isActive: true
  }, {
    title: "دليل المدينة التجاري",
    description: "تصفح أدلة المحلات التجارية والشركات",
    icon: MapPin,
    onClick: () => {},
    isActive: false
  }, {
    title: "عروض وخصومات",
    description: "اكتشف أحدث العروض والخصومات المتاحة",
    icon: Gift,
    onClick: () => {},
    isActive: false
  }, {
    title: "صُنع في مدينتنا",
    description: "منتجات وخدمات محلية من أبناء المدينة",
    icon: ShoppingBag,
    onClick: () => {},
    isActive: false
  }, {
    title: "دليل المهنيين",
    description: "تواصل مع المهنيين والخبراء في المدينة",
    icon: Users,
    onClick: () => {},
    isActive: false
  }, {
    title: "عقارات المدينة",
    description: "ابحث عن العقارات المتاحة للبيع والإيجار",
    icon: Building2,
    onClick: () => {},
    isActive: false
  }, {
    title: "فرص استثمارية",
    description: "اطلع على الفرص الاستثمارية المتاحة",
    icon: TrendingUp,
    onClick: () => {},
    isActive: false
  }];
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          
          <h1 className="text-2xl font-bold text-foreground">مركز المال والأعمال</h1>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              أهلاً بك في مركز المال والأعمال لحدائق أكتوبر!
            </h2>
            <p className="text-muted-foreground">
              استكشف الفرص التجارية والوظيفية والخدمات المالية المتاحة في مدينتك
            </p>
          </div>
        </div>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {businessItems.map((item, index) => <div key={item.title} className="relative">
              <NavigationCard title={item.title} description={item.description} icon={item.icon} onClick={item.onClick} className={`animate-slide-up ${!item.isActive ? 'opacity-60' : ''}`} style={{
            animationDelay: `${0.1 + index * 0.1}s`
          }} />
              {!item.isActive && <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full z-10">
                  قريباً
                </div>}
              {item.isActive && <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full z-10">
                  متاح
                </div>}
            </div>)}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 text-center">
          <div className="glass-card p-4 rounded-xl max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              نعمل على إضافة المزيد من الخدمات قريباً لخدمتكم بشكل أفضل
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default Business;