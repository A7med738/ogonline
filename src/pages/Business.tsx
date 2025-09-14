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
  // Flatten all items from all groups into a single array
  const allItems = businessGroups.flatMap(group => group.items);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* All Icons in One Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 max-w-7xl mx-auto">
          {allItems.map((item, itemIndex) => (
            <div key={item.title} className="relative">
              <NavigationCard
                title={item.title}
                description=""
                icon={item.icon}
                onClick={item.onClick}
                className={`animate-slide-up ${!item.isActive ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${0.1 + itemIndex * 0.1}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Business;