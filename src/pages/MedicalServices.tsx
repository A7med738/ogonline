import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { Heart, Stethoscope, Building2, Hospital } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const MedicalServices = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    hospitals: 0,
    clinics: 0,
    healthUnits: 0,
    medicalCenters: 0
  });

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [hospitalsRes, clinicsRes, healthUnitsRes, medicalCentersRes] = await Promise.all([
        supabase.from('hospitals').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('clinics').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('health_units').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('medical_centers').select('id', { count: 'exact' }).eq('is_active', true)
      ]);

      setCounts({
        hospitals: hospitalsRes.count || 0,
        clinics: clinicsRes.count || 0,
        healthUnits: healthUnitsRes.count || 0,
        medicalCenters: medicalCentersRes.count || 0
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const medicalItems = [
    {
      title: "مستشفيات",
      description: `${counts.hospitals} مستشفى عام وخاص في المدينة`,
      icon: Hospital,
      onClick: () => navigate("/medical-services/hospitals"),
      isActive: true
    },
    {
      title: "عيادات",
      description: `${counts.clinics} عيادة خاصة ومتخصصة`,
      icon: Stethoscope,
      onClick: () => navigate("/medical-services/clinics"),
      isActive: true
    },
    {
      title: "وحدات صحية",
      description: `${counts.healthUnits} وحدة صحية ومركز طبي أساسي`,
      icon: Heart,
      onClick: () => navigate("/medical-services/health-units"),
      isActive: true
    },
    {
      title: "مراكز طبية",
      description: `${counts.medicalCenters} مركز طبي متخصص ومرافق صحية`,
      icon: Building2,
      onClick: () => navigate("/medical-services/medical-centers"),
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
