import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Search, Users, Wrench, HandHeart, Siren, Building2, Calendar, Zap, Bus, MapPin, BarChart3, Construction, Trash2, Stethoscope, Laptop, CreditCard, Banknote, Mail, Trophy } from "lucide-react";

const CityServices = () => {
  const navigate = useNavigate();

  const serviceGroups = [
    {
      title: "الأدلة والمعلومات الأساسية",
      items: [
        {
          title: "توصيلة",
          description: "دورات المدارس وخدمات النقل المدرسي",
          icon: Bus,
          onClick: () => navigate("/services/school-transport"),
          isActive: true
        },
        {
          title: "ATM",
          description: "مواقع أجهزة الصراف الآلي في المدينة",
          icon: CreditCard,
          onClick: () => navigate("/services/atm-locations"),
          isActive: true
        },
        {
          title: "بنوك",
          description: "فروع البنوك وخدماتها في المدينة",
          icon: Banknote,
          onClick: () => navigate("/services/banks"),
          isActive: true
        },
        {
          title: "مكاتب البريد",
          description: "مكاتب البريد وخدمات الشحن في المدينة",
          icon: Mail,
          onClick: () => navigate("/services/post-offices"),
          isActive: true
        },
        {
          title: "نوادي ومراكز شباب",
          description: "نوادي رياضية ومراكز شباب في المدينة",
          icon: Trophy,
          onClick: () => navigate("/services/youth-clubs"),
          isActive: true
        }
      ]
    },
    {
      title: "التفاعل والمشاركة",
      items: [
        {
          title: "مفقودات وموجودات",
          description: "الإبلاغ أو البحث عن مفقودات",
          icon: Search,
          onClick: () => navigate("/services/lost-and-found"),
          isActive: true
        }
      ]
    },
    {
      title: "المجتمع والتنمية",
      items: [
        {
          title: "فعاليات وجدول الأنشطة",
          description: "الفعاليات العامة والمهرجانات والأنشطة الرياضية في المدينة",
          icon: Calendar,
          onClick: () => {},
          isActive: false
        },
      ]
    },
    {
      title: "الشفافية والمشاريع",
      items: [
      ]
    }
  ];

  // Flatten all items from all groups into a single array
  const allItems = serviceGroups.flatMap(group => group.items);

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

export default CityServices;


