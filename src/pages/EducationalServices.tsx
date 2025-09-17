import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { GraduationCap, Baby, BookOpen, Users, Building2, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const EducationalServices = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    schools: 0,
    nurseries: 0,
    centers: 0,
    teachers: 0,
    universities: 0,
    educationDepartment: 1
  });

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [schoolsRes, nurseriesRes, centersRes, teachersRes, universitiesRes] = await Promise.all([
        supabase.from('schools').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('nurseries').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('educational_centers').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('teachers').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('universities').select('id', { count: 'exact' }).eq('is_active', true)
      ]);

      setCounts({
        schools: schoolsRes.count || 0,
        nurseries: nurseriesRes.count || 0,
        centers: centersRes.count || 0,
        teachers: teachersRes.count || 0,
        universities: universitiesRes.count || 0,
        educationDepartment: 1 // خدمة ثابتة
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const educationalItems = [
    {
      title: "مدارس",
      description: `${counts.schools} مدرسة حكومية وخاصة في المدينة`,
      icon: GraduationCap,
      onClick: () => navigate("/educational-services/schools"),
      isActive: true
    },
    {
      title: "حضانات",
      description: `${counts.nurseries} حضانة ومركز رعاية أطفال`,
      icon: Baby,
      onClick: () => navigate("/educational-services/nurseries"),
      isActive: true
    },
    {
      title: "سناتر",
      description: `${counts.centers} مركز تعليمي ومراجعة`,
      icon: BookOpen,
      onClick: () => navigate("/educational-services/centers"),
      isActive: true
    },
    {
      title: "مدرسين",
      description: `${counts.teachers} مدرس ودروس خصوصية`,
      icon: Users,
      onClick: () => navigate("/educational-services/teachers"),
      isActive: true
    },
    {
      title: "جامعات",
      description: `${counts.universities} جامعة ومعهد عالي في المدينة`,
      icon: Building2,
      onClick: () => navigate("/educational-services/universities"),
      isActive: true
    },
    {
      title: "الإدارة التعليمية",
      description: "إدارة التعليم والتعليم العالي في المدينة",
      icon: Settings,
      onClick: () => navigate("/educational-services/education-department"),
      isActive: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* All Icons in One Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 max-w-6xl mx-auto">
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
