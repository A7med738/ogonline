import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModernServiceCard } from '@/components/ModernServiceCard';
import { Users, MapPin, Phone, Mail, Globe, Clock, Star, DollarSign, CheckCircle, XCircle, Languages, ExternalLink, Dumbbell, Trophy, GraduationCap, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface YouthClub {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  capacity?: number;
  operating_hours?: string;
  age_groups?: string[];
  activities?: string[];
  facilities?: string[];
  membership_required: boolean;
  membership_fee?: number;
  free_activities: boolean;
  languages?: string[];
  rating: number;
  google_maps_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CityServicesYouthClubs = () => {
  const [youthClubs, setYouthClubs] = useState<YouthClub[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadYouthClubs();
  }, []);

  const loadYouthClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('youth_clubs')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setYouthClubs(data || []);
    } catch (error) {
      console.error('Error loading youth clubs:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الخدمات الرياضية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      sports_club: 'نادي رياضي',
      gym: 'جيم',
      academy: 'أكاديمية رياضية',
      stadium: 'ملعب',
      youth_center: 'مركز شباب',
      cultural_center: 'مركز ثقافي',
      community_center: 'مركز مجتمعي',
      recreation_center: 'مركز ترفيهي',
      art_center: 'مركز فني'
    };
    return types[type] || type;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل الخدمات الرياضية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Dumbbell className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 ml-2 sm:ml-4" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">الخدمات الرياضية</h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg">اكتشف أفضل الخدمات الرياضية في المدينة</p>
        </div>

        {/* Sports Services Categories */}
        <div className="mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">اختر نوع الخدمة الرياضية</h2>
            <p className="text-sm sm:text-base text-gray-600">اكتشف الخدمات الرياضية حسب نوعها</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {[
              { type: 'clubs', label: 'نوادي', icon: Users, color: 'bg-blue-100 text-blue-800 border-blue-200' },
              { type: 'gym', label: 'جيم', icon: Dumbbell, color: 'bg-green-100 text-green-800 border-green-200' },
              { type: 'academies', label: 'أكاديميات', icon: GraduationCap, color: 'bg-purple-100 text-purple-800 border-purple-200' },
              { type: 'stadiums', label: 'ملاعب', icon: Trophy, color: 'bg-orange-100 text-orange-800 border-orange-200' }
            ].map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${color} border-current shadow-md`}
              >
                <div className="text-center">
                  <div className="mx-auto mb-1 sm:mb-2 p-1 sm:p-1.5 rounded-full bg-white/20">
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 mx-auto text-current" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold mb-1 text-current">
                    {label}
                  </h3>
                  <p className="text-xs text-current/80">
                    0
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sports Services Grid */}
        {youthClubs.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خدمات رياضية</h3>
            <p className="text-gray-600">لا توجد خدمات رياضية متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {youthClubs.map((club) => (
              <ModernServiceCard
                key={club.id}
                id={club.id}
                name={club.name}
                subtitle={club.description}
                type={getTypeLabel(club.type)}
                rating={club.rating}
                address={club.address}
                phone={club.phone}
                logoUrl={club.logo_url}
                icon={<Dumbbell className="h-6 w-6 text-blue-600" />}
                features={[
                  {
                    label: "عضوية مطلوبة",
                    available: club.membership_required
                  },
                  {
                    label: "أنشطة مجانية متاحة",
                    available: club.free_activities
                  }
                ]}
                membershipInfo={[
                  {
                    label: "يحتاج عضوية",
                    available: club.membership_required
                  },
                  {
                    label: "أنشطة مدفوعة",
                    available: !!(club.membership_fee && club.membership_fee > 0)
                  }
                ]}
                onViewLocation={club.google_maps_url ? () => window.open(club.google_maps_url, '_blank') : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityServicesYouthClubs;
