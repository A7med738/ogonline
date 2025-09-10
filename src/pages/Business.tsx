import { Briefcase, ShoppingBag, Building2, TrendingUp, Lightbulb, DollarSign, Users, Calendar, Scale, Laptop, Trophy, GraduationCap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Button } from "@/components/ui/button";

const Business = () => {
  const navigate = useNavigate();
  
  const businessGroups = [
    {
      title: "البحث عن عمل وتوظيف المواهب",
      items: [
        {
          title: "وظائف وفرص",
          description: "ابحث عن الوظائف والفرص الوظيفية المتاحة في المدينة",
          icon: Briefcase,
          onClick: () => navigate("/jobs"),
          isActive: true
        },
        {
          title: "بنك المواهب",
          description: "قاعدة بيانات للمواهب المتخصصة في المدينة للعمل على مشاريع محددة",
          icon: GraduationCap,
          onClick: () => {},
          isActive: false
        },
        {
          title: "سوق المستقلين",
          description: "منصة تجمع المستقلين مع أصحاب المشاريع لبناء اقتصاد محلي متكامل",
          icon: Laptop,
          onClick: () => {},
          isActive: false
        }
      ]
    },
    {
      title: "دعم رواد الأعمال والشركات",
      items: [
        {
          title: "حاضنة أعمال المدينة",
          description: "ربط رواد الأعمال بالخبراء والموجهين لمساعدة الأفكار الجديدة على النمو",
          icon: Lightbulb,
          onClick: () => {},
          isActive: false
        },
        {
          title: "تمويل واستثمار",
          description: "منصة تجمع أصحاب المشاريع مع المستثمرين المحليين وبرامج التمويل الحكومية",
          icon: DollarSign,
          onClick: () => {},
          isActive: false
        },
        {
          title: "خدمات الدعم القانوني والمحاسبي",
          description: "دليل مكاتب المحاماة والمحاسبة المتخصصة للشركات الناشئة",
          icon: Scale,
          onClick: () => {},
          isActive: false
        },
        {
          title: "مساحات عمل مشتركة",
          description: "دليل مساحات العمل المشتركة مع الأسعار والخدمات المتاحة",
          icon: Users,
          onClick: () => {},
          isActive: false
        }
      ]
    },
    {
      title: "مجتمع الأعمال والإلهام",
      items: [
        {
          title: "فعاليات رواد الأعمال",
          description: "تقويم اللقاءات والندوات وورش العمل لمجتمع الأعمال في المدينة",
          icon: Calendar,
          onClick: () => {},
          isActive: false
        },
        {
          title: "قصص نجاح",
          description: "قصص ملهمة لرواد أعمال من المدينة لتحفيز الآخرين على البدء",
          icon: Trophy,
          onClick: () => {},
          isActive: false
        },
        {
          title: "صُنع في مدينتنا",
          description: "منتجات وخدمات محلية من أبناء المدينة",
          icon: ShoppingBag,
          onClick: () => {},
          isActive: false
        }
      ]
    }
  ];
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">مركز المال والأعمال</h1>
        </div>

        {/* Business Groups */}
        <div className="space-y-8 sm:space-y-12">
          {businessGroups.map((group, groupIndex) => (
            <div key={group.title} className="animate-fade-in" style={{ animationDelay: `${groupIndex * 0.2}s` }}>
              {/* Group Title */}
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6 text-center">
                {group.title}
              </h2>
              
              {/* Group Items Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-4 max-w-6xl mx-auto">
                {group.items.map((item, itemIndex) => (
                  <div key={item.title} className="relative">
                    <NavigationCard
                      title={item.title}
                      description={item.description}
                      icon={item.icon}
                      onClick={item.onClick}
                      className={`animate-slide-up ${!item.isActive ? 'opacity-60' : ''}`}
                      style={{ animationDelay: `${0.1 + itemIndex * 0.1}s` }}
                    />
                    {!item.isActive && (
                      <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full z-10">
                        قريباً
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Business;