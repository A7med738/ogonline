import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Heart, Stethoscope, Building2, Hospital } from "lucide-react";

const MedicalServices = () => {
  const navigate = useNavigate();

  const medicalItems = [
    {
      title: "وحدات صحية",
      description: "الوحدات الصحية والمراكز الطبية الأساسية",
      icon: Heart,
      onClick: () => navigate("/medical-services/health-units"),
      isActive: true
    },
    {
      title: "عيادات",
      description: "عيادات خاصة ومتخصصة في المدينة",
      icon: Stethoscope,
      onClick: () => navigate("/medical-services/clinics"),
      isActive: true
    },
    {
      title: "مراكز طبية",
      description: "مراكز طبية متخصصة ومرافق صحية",
      icon: Building2,
      onClick: () => navigate("/medical-services/medical-centers"),
      isActive: true
    },
    {
      title: "مستشفيات",
      description: "مستشفيات عامة وخاصة في المدينة",
      icon: Hospital,
      onClick: () => navigate("/medical-services/hospitals"),
      isActive: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* All Icons in One Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 max-w-6xl mx-auto">
          {medicalItems.map((item, itemIndex) => (
            <div key={item.title} className="relative">
              <NavigationCard
                title={item.title}
                description=""
                icon={item.icon}
                onClick={item.onClick}
                className="animate-slide-up"
                style={{ animationDelay: `${0.1 + itemIndex * 0.1}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicalServices;
