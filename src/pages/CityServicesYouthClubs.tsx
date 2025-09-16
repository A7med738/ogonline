import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModernServiceCard } from '@/components/ModernServiceCard';
import { Users, MapPin, Phone, Mail, Globe, Clock, Star, DollarSign, CheckCircle, XCircle, Languages, ExternalLink } from 'lucide-react';
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
        description: 'حدث خطأ أثناء تحميل النوادي',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      sports_club: 'نادي رياضي',
      cultural_center: 'مركز ثقافي',
      youth_center: 'مركز شباب',
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
          <p className="mt-4 text-lg text-gray-600">جاري تحميل النوادي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-purple-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">النوادي ومراكز الشباب</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل النوادي ومراكز الشباب في المدينة</p>
        </div>

        {/* Youth Clubs Grid */}
        {youthClubs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نوادي</h3>
            <p className="text-gray-600">لا توجد نوادي متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                icon={<Users className="h-6 w-6 text-purple-600" />}
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
