import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { CreditCard, Building2, Users, Calendar, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CityServices = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    atms: 0,
    banks: 0,
    youthClubs: 0,
    events: 0,
    postOffices: 0
  });

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [atmsRes, banksRes, youthClubsRes, eventsRes, postOfficesRes] = await Promise.all([
        supabase.from('atms').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('banks').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('youth_clubs').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('events').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('post_offices').select('id', { count: 'exact' }).eq('is_active', true)
      ]);

      setCounts({
        atms: atmsRes.count || 0,
        banks: banksRes.count || 0,
        youthClubs: youthClubsRes.count || 0,
        events: eventsRes.count || 0,
        postOffices: postOfficesRes.count || 0
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const cityServiceItems = [
    {
      title: "أجهزة الصراف الآلي",
      description: `${counts.atms} جهاز صراف آلي في المدينة`,
      icon: CreditCard,
      onClick: () => navigate("/city-services/atms"),
      isActive: true
    },
    {
      title: "البنوك",
      description: `${counts.banks} بنك وفرع مصرفي`,
      icon: Building2,
      onClick: () => navigate("/city-services/banks"),
      isActive: true
    },
    {
      title: "النوادي ومراكز الشباب",
      description: `${counts.youthClubs} نادي ومركز شباب`,
      icon: Users,
      onClick: () => navigate("/city-services/youth-clubs"),
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
      title: "مكاتب البريد",
      description: `${counts.postOffices} مكتب بريد وخدمة بريدية`,
      icon: Mail,
      onClick: () => navigate("/city-services/post-offices"),
      isActive: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* All Icons in One Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {cityServiceItems.map((item, itemIndex) => (
            <NavigationCard
              key={item.title}
              title={item.title}
              description={item.description}
              icon={item.icon}
              onClick={item.onClick}
              isActive={item.isActive}
              className="h-full"
              style={{ animationDelay: `${0.1 + itemIndex * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CityServices;