import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Search, Users, Wrench, HandHeart, Siren } from "lucide-react";

const CityServices = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "مفقودات وموجودات",
      description: "الإبلاغ أو البحث عن مفقودات",
      icon: Search,
      onClick: () => navigate("/services/lost-and-found"),
    },
    {
      title: "مبادرات الحي",
      description: "مبادرات مجتمعية ونشاطات الحي",
      icon: Users,
      onClick: () => navigate("/services/neighborhood-initiatives"),
    },
    {
      title: "بلاغات وتحسينات",
      description: "الإبلاغ عن أعطال واقتراح تحسينات",
      icon: Wrench,
      onClick: () => navigate("/services/reports-improvements"),
    },
    {
      title: "تبرعات ومساعدات",
      description: "مبادرات تبرع ودعم المحتاجين",
      icon: HandHeart,
      onClick: () => navigate("/services/donations-aid"),
    },
    {
      title: "دليل الطوارئ",
      description: "أرقام وعناوين الطوارئ المهمة",
      icon: Siren,
      onClick: () => navigate("/services/emergency-directory"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h3 className="md:text-2xl text-xl font-bold text-foreground">خدمات المدينة</h3>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 max-w-4xl mx-auto px-2 md:px-4">
          {services.map((svc, index) => (
            <NavigationCard
              key={svc.title}
              title={svc.title}
              description={svc.description}
              icon={svc.icon}
              onClick={svc.onClick}
              className="animate-slide-up"
              style={{ animationDelay: `${0.4 + index * 0.08}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CityServices;


