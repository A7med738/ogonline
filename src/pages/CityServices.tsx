import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { CreditCard, Building2, Users, Calendar, Mail, Moon, Wrench, Bus, Car, FileText, ShoppingCart, Phone, Scale, Home, Hotel, Fuel, Zap, Flame, Baby } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthGuard from "@/components/AuthGuard";

const CityServices = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    atms: 0,
    banks: 0,
    youthClubs: 0,
    events: 0,
    postOffices: 0,
    worshipPlaces: 0,
    craftsmen: 0,
    trips: 0,
    traffic: 0,
    civilRegistry: 0,
    wholesaleMarket: 0,
    cityCenter: 0,
    familyCourt: 0,
    courts: 0,
    hotels: 0,
    gasStations: 0,
    gasCompany: 0,
    electricityCompany: 0
  });

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [atmsRes, banksRes, youthClubsRes, eventsRes, postOfficesRes, worshipPlacesRes, craftsmenRes, tripsRes, hotelsRes] = await Promise.all([
        supabase.from('atms').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('banks').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('youth_clubs').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('events').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('post_offices').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('worship_places').select('id', { count: 'exact' }),
        supabase.from('craftsmen').select('id', { count: 'exact' }).eq('is_active', true).then(res => ({ count: 0, ...res })),
        supabase.from('trips').select('id', { count: 'exact' }).eq('status', 'active').then(res => ({ count: 0, ...res })),
        supabase.from('hotels').select('id', { count: 'exact' }).eq('is_active', true).then(res => ({ count: 0, ...res }))
      ]);

      setCounts({
        atms: atmsRes.count || 0,
        banks: banksRes.count || 0,
        youthClubs: youthClubsRes.count || 0,
        events: eventsRes.count || 0,
        postOffices: postOfficesRes.count || 0,
        worshipPlaces: worshipPlacesRes.count || 0,
        craftsmen: craftsmenRes.count || 0,
        trips: tripsRes.count || 0,
        traffic: 1, // مرور - خدمة ثابتة
        civilRegistry: 1, // سجل مدني - خدمة ثابتة
        wholesaleMarket: 1, // سوق الجمله - خدمة ثابتة
        cityCenter: 1, // سنترال المدينه - خدمة ثابتة
        familyCourt: 1, // نيابة الاسره - خدمة ثابتة
        courts: 1, // مجمع المحاكم - خدمة ثابتة
        hotels: hotelsRes.count || 0 // فنادق المدينة - من قاعدة البيانات
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  // خدمات حكومية ومدنية
  const governmentServices = [
    {
      title: "سجل مدني",
      description: "خدمات السجل المدني والهوية",
      icon: FileText,
      onClick: () => navigate("/city-services/civil-registry"),
      isActive: true
    },
    {
      title: "مرور",
      description: "خدمات المرور والتراخيص",
      icon: Car,
      onClick: () => navigate("/city-services/traffic"),
      isActive: true
    },
    {
      title: "مجمع المحاكم",
      description: "مجمع المحاكم والخدمات القضائية",
      icon: Home,
      onClick: () => navigate("/city-services/courts"),
      isActive: true
    },
    {
      title: "نيابة الاسره",
      description: "نيابة الأسرة والمحاكم الشرعية",
      icon: Scale,
      onClick: () => navigate("/city-services/family-court"),
      isActive: true
    },
    {
      title: "مكاتب البريد",
      description: `${counts.postOffices} مكتب بريد وخدمة بريدية`,
      icon: Mail,
      onClick: () => navigate("/city-services/post-offices"),
      isActive: true
    }
  ];

  // خدمات مالية ومصرفية
  const financialServices = [
    {
      title: "البنوك",
      description: `${counts.banks} بنك وفرع مصرفي`,
      icon: Building2,
      onClick: () => navigate("/city-services/banks"),
      isActive: true
    },
    {
      title: "أجهزة الصراف الآلي",
      description: `${counts.atms} جهاز صراف آلي في المدينة`,
      icon: CreditCard,
      onClick: () => navigate("/city-services/atms"),
      isActive: true
    }
  ];

  // خدمات يومية ومعيشية
  const dailyServices = [
    {
      title: "سوق الجمله",
      description: "سوق الجملة والمواد الغذائية",
      icon: ShoppingCart,
      onClick: () => navigate("/city-services/wholesale-market"),
      isActive: true
    },
    {
      title: "دور العبادة",
      description: `${counts.worshipPlaces} مسجد وكنيسة ومعبد في المدينة`,
      icon: Moon,
      onClick: () => navigate("/worship-places"),
      isActive: true
    },
    {
      title: "سنترال المدينه",
      description: "السنترال الرئيسي للمدينة",
      icon: Phone,
      onClick: () => navigate("/city-services/city-center"),
      isActive: true
    },
    {
      title: "محطات الوقود",
      description: `${counts.gasStations} محطة وقود في المدينة`,
      icon: Fuel,
      onClick: () => navigate("/city-services/gas-stations"),
      isActive: true
    },
    {
      title: "شركة الغاز",
      description: `${counts.gasCompany} فرع لشركة الغاز`,
      icon: Flame,
      onClick: () => navigate("/city-services/gas-company"),
      isActive: true
    },
    {
      title: "شركة الكهرباء",
      description: `${counts.electricityCompany} فرع لشركة الكهرباء`,
      icon: Zap,
      onClick: () => navigate("/city-services/electricity-company"),
      isActive: true
    }
  ];

  // مواصلات وتنقل
  const transportationServices = [
    {
      title: "توصيلة",
      description: `${counts.trips} رحلة مشتركة متاحة`,
      icon: Bus,
      onClick: () => navigate("/trip-service"),
      isActive: true
    }
  ];

  // خدمات ترفيهية واجتماعية
  const entertainmentServices = [
    {
      title: "خدمات رياضية",
      description: `${counts.youthClubs} خدمة رياضية متاحة`,
      icon: Users,
      onClick: () => navigate("/city-services/youth-clubs"),
      isActive: true
    },
    {
      title: "خدمات الأطفال",
      description: "ملاهي وكيدز ايريا وأنشطة ترفيهية",
      icon: Baby,
      onClick: () => navigate("/city-services/children-services"),
      isActive: true
    },
    {
      title: "الفعاليات والأنشطة",
      description: `${counts.events} فعالية ونشاط متاح`,
      icon: Calendar,
      onClick: () => navigate("/city-services/events"),
      isActive: true
    },
    {
      title: "فنادق المدينة",
      description: `${counts.hotels} فندق ومنتجع في المدينة`,
      icon: Hotel,
      onClick: () => navigate("/city-services/hotels"),
      isActive: true
    }
  ];

  // خدمات صناعية وحرفية
  const industrialServices = [
    {
      title: "الصنايعية",
      description: `${counts.craftsmen} صانع وحرفي في المدينة`,
      icon: Wrench,
      onClick: () => navigate("/city-services/craftsmen"),
      isActive: true
    }
  ];

  const renderServiceSection = (title: string, services: any[], color: string) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">{title}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 lg:gap-6">
        {services.map((item, itemIndex) => (
          <NavigationCard
            key={item.title}
            title={item.title}
            description={item.description}
            icon={item.icon}
            onClick={item.onClick}
            isActive={item.isActive}
            className="h-full"
            color={color}
            style={{ animationDelay: `${0.1 + itemIndex * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">

          {/* Services by Category */}
          {renderServiceSection("خدمات حكومية ومدنية", governmentServices, "from-blue-500 to-cyan-500")}
          {renderServiceSection("خدمات مالية ومصرفية", financialServices, "from-green-500 to-emerald-500")}
          {renderServiceSection("خدمات يومية ومعيشية", dailyServices, "from-orange-500 to-amber-500")}
          {renderServiceSection("مواصلات وتنقل", transportationServices, "from-purple-500 to-violet-500")}
          {renderServiceSection("خدمات ترفيهية واجتماعية", entertainmentServices, "from-pink-500 to-rose-500")}
          {renderServiceSection("خدمات صناعية وحرفية", industrialServices, "from-gray-500 to-slate-500")}
        </div>
      </div>
    </AuthGuard>
  );
};

export default CityServices;