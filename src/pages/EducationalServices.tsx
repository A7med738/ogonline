import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { GraduationCap, Baby, BookOpen, Users } from "lucide-react";

const EducationalServices = () => {
  const navigate = useNavigate();

  const educationalItems = [
    {
      title: "مدارس",
      description: "مدارس حكومية وخاصة في المدينة",
      icon: GraduationCap,
      onClick: () => navigate("/educational-services/schools"),
      isActive: true
    },
    {
      title: "حضانات",
      description: "حضانات ومراكز رعاية الأطفال",
      icon: Baby,
      onClick: () => navigate("/educational-services/nurseries"),
      isActive: true
    },
    {
      title: "سناتر",
      description: "مراكز تعليمية ومراجعة",
      icon: BookOpen,
      onClick: () => navigate("/educational-services/centers"),
      isActive: true
    },
    {
      title: "مدرسين",
      description: "دليل المدرسين والدروس الخصوصية",
      icon: Users,
      onClick: () => navigate("/educational-services/teachers"),
      isActive: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* All Icons in One Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {educationalItems.map((item, itemIndex) => (
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

export default EducationalServices;
