import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Search, Users, Wrench, HandHeart, Siren, Building2, Calendar, Zap, Bus, MapPin, BarChart3, Construction, Trash2, Stethoscope, Laptop } from "lucide-react";

const CityServices = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "مفقودات وموجودات",
      description: "الإبلاغ أو البحث عن مفقودات",
      icon: Search,
      onClick: () => navigate("/services/lost-and-found"),
      isActive: true
    },
    {
      title: "دليل الأعمال والخدمات",
      description: "دليل المحلات التجارية والمطاعم والورش الحرفية مع التقييمات",
      icon: Building2,
      onClick: () => {},
      isActive: false
    },
    {
      title: "فعاليات وجدول الأنشطة",
      description: "الفعاليات العامة والمهرجانات والأنشطة الرياضية في المدينة",
      icon: Calendar,
      onClick: () => {},
      isActive: false
    },
    {
      title: "خدمات المرافق",
      description: "الإبلاغ عن أعطال المياه والكهرباء والاستعلام عن الفواتير",
      icon: Zap,
      onClick: () => {},
      isActive: false
    },
    {
      title: "دورات المدينة",
      description: "دورات المدارس وخدمات النقل المدرسي",
      icon: Bus,
      onClick: () => navigate("/services/school-transport"),
      isActive: true
    },
    {
      title: "المرافق العامة",
      description: "دليل الحدائق والمكتبات والملاعب والمراكز المجتمعية",
      icon: MapPin,
      onClick: () => {},
      isActive: false
    },
    {
      title: "استطلاعات الرأي",
      description: "استطلاعات رأي السكان حول القرارات والمشاريع الجديدة",
      icon: BarChart3,
      onClick: () => {},
      isActive: false
    },
    {
      title: "مشاريع تحت التنفيذ",
      description: "عرض مشاريع البلدية مع الجدول الزمني ونسبة الإنجاز",
      icon: Construction,
      onClick: () => {},
      isActive: false
    },
    {
      title: "خدمات النظافة والبيئة",
      description: "مواعيد جمع القمامة وأماكن إعادة التدوير والإبلاغ عن مشاكل النظافة",
      icon: Trash2,
      onClick: () => {},
      isActive: false
    },
    {
      title: "دليل الصحة",
      description: "خريطة الصيدليات المناوبة والعيادات والمستشفيات مع أرقام الطوارئ",
      icon: Stethoscope,
      onClick: () => {},
      isActive: false
    },
    {
      title: "مساحات العمل المشتركة",
      description: "دليل أماكن العمل المشتركة والمكتبات الهادئة للعمل والدراسة",
      icon: Laptop,
      onClick: () => {},
      isActive: false
    },
    {
      title: "مبادرات الحي",
      description: "مبادرات مجتمعية ونشاطات الحي",
      icon: Users,
      onClick: () => navigate("/services/neighborhood-initiatives"),
      isActive: false
    },
    {
      title: "بلاغات وتحسينات",
      description: "الإبلاغ عن أعطال واقتراح تحسينات",
      icon: Wrench,
      onClick: () => navigate("/services/reports-improvements"),
      isActive: false
    },
    {
      title: "تبرعات ومساعدات",
      description: "مبادرات تبرع ودعم المحتاجين",
      icon: HandHeart,
      onClick: () => navigate("/services/donations-aid"),
      isActive: false
    },
    {
      title: "دليل الطوارئ",
      description: "أرقام وعناوين الطوارئ المهمة",
      icon: Siren,
      onClick: () => navigate("/services/emergency-directory"),
      isActive: false
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h3 className="md:text-2xl text-xl font-bold text-foreground">خدمات المدينة</h3>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {services.map((svc, index) => (
            <div key={svc.title} className="relative">
              <NavigationCard
                title={svc.title}
                description={svc.description}
                icon={svc.icon}
                onClick={svc.onClick}
                className={`animate-slide-up ${!svc.isActive ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              />
              {!svc.isActive && (
                <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full z-10">
                  قريباً
                </div>
              )}
              {svc.isActive && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full z-10">
                  متاح
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CityServices;


