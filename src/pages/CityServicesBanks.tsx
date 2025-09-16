import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModernServiceCard } from '@/components/ModernServiceCard';
import { Building2, MapPin, Phone, Mail, Globe, Clock, Star, Car, Accessibility, Languages, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Bank {
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
  operating_hours?: string;
  services?: string[];
  languages?: string[];
  atm_available: boolean;
  parking_available: boolean;
  wheelchair_accessible: boolean;
  online_banking: boolean;
  mobile_banking: boolean;
  rating: number;
  google_maps_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CityServicesBanks = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error('Error loading banks:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل البنوك',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل البنوك...</p>
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
            <Building2 className="h-12 w-12 text-green-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">البنوك</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل البنوك والخدمات المصرفية في المدينة</p>
        </div>

        {/* Banks Grid */}
        {banks.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بنوك</h3>
            <p className="text-gray-600">لا توجد بنوك متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {banks.map((bank) => (
              <ModernServiceCard
                key={bank.id}
                id={bank.id}
                name={bank.name}
                subtitle={bank.description}
                type={getTypeLabel(bank.type)}
                rating={bank.rating}
                address={bank.address}
                phone={bank.phone}
                logoUrl={bank.logo_url}
                icon={<Building2 className="h-6 w-6 text-green-600" />}
                features={[
                  {
                    label: "صراف آلي",
                    available: bank.atm_available || false
                  },
                  {
                    label: "موقف سيارات",
                    available: bank.parking_available || false
                  },
                  {
                    label: "إمكانية وصول",
                    available: bank.wheelchair_accessible || false
                  },
                  {
                    label: "بنك إلكتروني",
                    available: bank.online_banking || false
                  }
                ]}
                onViewLocation={bank.google_maps_url ? () => window.open(bank.google_maps_url, '_blank') : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityServicesBanks;
