import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModernServiceCard } from '@/components/ModernServiceCard';
import { CreditCard, MapPin, Phone, Clock, DollarSign, Accessibility, Languages, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ATM {
  id: string;
  name: string;
  bank_name: string;
  address?: string;
  phone?: string;
  services?: string[];
  operating_hours?: string;
  accessibility_features?: string[];
  languages?: string[];
  fees?: string;
  google_maps_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CityServicesATMs = () => {
  const [atms, setAtms] = useState<ATM[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadATMs();
  }, []);

  const loadATMs = async () => {
    try {
      const { data, error } = await supabase
        .from('atms')
        .select('*')
        .eq('is_active', true)
        .order('bank_name', { ascending: true });

      if (error) throw error;
      setAtms(data || []);
    } catch (error) {
      console.error('Error loading ATMs:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل أجهزة الصراف الآلي',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل أجهزة الصراف الآلي...</p>
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
            <CreditCard className="h-12 w-12 text-blue-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">أجهزة الصراف الآلي</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أقرب أجهزة الصراف الآلي في المدينة</p>
        </div>

        {/* ATMs Grid */}
        {atms.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أجهزة صراف آلي</h3>
            <p className="text-gray-600">لا توجد أجهزة صراف آلي متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {atms.map((atm) => (
              <ModernServiceCard
                key={atm.id}
                id={atm.id}
                name={atm.name}
                subtitle={atm.bank_name}
                type="صراف آلي"
                rating={0}
                address={atm.address}
                phone={atm.phone}
                icon={<CreditCard className="h-6 w-6 text-blue-600" />}
                features={[
                  {
                    label: "خدمات متعددة",
                    available: !!(atm.services && atm.services.length > 0)
                  },
                  {
                    label: "إمكانية وصول",
                    available: !!(atm.accessibility_features && atm.accessibility_features.length > 0)
                  },
                  {
                    label: "لغات متعددة",
                    available: !!(atm.languages && atm.languages.length > 0)
                  }
                ]}
                onViewLocation={atm.google_maps_url ? () => window.open(atm.google_maps_url, '_blank') : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityServicesATMs;
