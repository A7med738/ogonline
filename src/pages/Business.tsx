import { Briefcase, ShoppingBag, Building2, TrendingUp, Lightbulb, DollarSign, Users, Calendar, Scale, Laptop, Trophy, GraduationCap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Button } from "@/components/ui/button";
const Business = () => {
  const navigate = useNavigate();
  const businessItems = [{
    title: "وظائف وفرص",
    description: "ابحث عن الوظائف والفرص الوظيفية المتاحة في المدينة",
    icon: Briefcase,
    onClick: () => navigate("/jobs"),
    isActive: true
  }, {
    title: "بنك المواهب",
    description: "قاعدة بيانات للمواهب المتخصصة في المدينة للعمل على مشاريع محددة",
    icon: GraduationCap,
    onClick: () => {},
    isActive: false
  }, {
    title: "حاضنة أعمال المدينة",
    description: "ربط رواد الأعمال بالخبراء والموجهين لمساعدة الأفكار الجديدة على النمو",
    icon: Lightbulb,
    onClick: () => {},
    isActive: false
  }, {
    title: "تمويل واستثمار",
    description: "منصة تجمع أصحاب المشاريع مع المستثمرين المحليين وبرامج التمويل الحكومية",
    icon: DollarSign,
    onClick: () => {},
    isActive: false
  }, {
    title: "مساحات عمل مشتركة",
    description: "دليل مساحات العمل المشتركة مع الأسعار والخدمات المتاحة",
    icon: Users,
    onClick: () => {},
    isActive: false
  }, {
    title: "فعاليات رواد الأعمال",
    description: "تقويم اللقاءات والندوات وورش العمل لمجتمع الأعمال في المدينة",
    icon: Calendar,
    onClick: () => {},
    isActive: false
  }, {
    title: "خدمات الدعم القانوني والمحاسبي",
    description: "دليل مكاتب المحاماة والمحاسبة المتخصصة للشركات الناشئة",
    icon: Scale,
    onClick: () => {},
    isActive: false
  }, {
    title: "سوق المستقلين",
    description: "منصة تجمع المستقلين مع أصحاب المشاريع لبناء اقتصاد محلي متكامل",
    icon: Laptop,
    onClick: () => {},
    isActive: false
  }, {
    title: "قصص نجاح",
    description: "قصص ملهمة لرواد أعمال من المدينة لتحفيز الآخرين على البدء",
    icon: Trophy,
    onClick: () => {},
    isActive: false
  }, {
    title: "صُنع في مدينتنا",
    description: "منتجات وخدمات محلية من أبناء المدينة",
    icon: ShoppingBag,
    onClick: () => {},
    isActive: false
  }, {
    title: "عقارات المدينة",
    description: "ابحث عن العقارات المتاحة للبيع والإيجار",
    icon: Building2,
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
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {businessItems.map((item, index) => <div key={item.title} className="relative">
              <NavigationCard title={item.title} description={item.description} icon={item.icon} onClick={item.onClick} className={`animate-slide-up ${!item.isActive ? 'opacity-60' : ''}`} style={{
            animationDelay: `${0.1 + index * 0.1}s`
          }} />
              {!item.isActive && <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full z-10">
                  قريباً
                </div>}
              {item.isActive}
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