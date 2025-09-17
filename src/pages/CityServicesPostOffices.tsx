import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModernServiceCard } from '@/components/ModernServiceCard';
import { Mail, MapPin, Phone, Mail as MailIcon, Clock, Star, Car, Accessibility, Languages, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostOffice {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  image_url?: string;
  established_year?: number;
  operating_hours?: string;
  services?: string[];
  languages?: string[];
  parking_available: boolean;
  wheelchair_accessible: boolean;
  atm_available: boolean;
  rating: number;
  google_maps_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CityServicesPostOffices = () => {
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPostOffices();
  }, []);

  const loadPostOffices = async () => {
    try {
      const { data, error } = await supabase
        .from('post_offices')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setPostOffices(data || []);
    } catch (error) {
      console.error('Error loading post offices:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل مكاتب البريد',
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل مكاتب البريد...</p>
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
            <Mail className="h-12 w-12 text-red-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">مكاتب البريد</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أقرب مكاتب البريد والخدمات البريدية في المدينة</p>
        </div>

        {/* Post Offices Grid */}
        {postOffices.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مكاتب بريد</h3>
            <p className="text-gray-600">لا توجد مكاتب بريد متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {postOffices.map((office) => (
              <ModernServiceCard
                key={office.id}
                id={office.id}
                name={office.name}
                subtitle={office.description}
                type="مكتب بريد"
                rating={office.rating}
                address={office.address}
                phone={office.phone}
                logoUrl={office.image_url}
                icon={<Mail className="h-6 w-6 text-red-600" />}
                features={[]}
                onViewLocation={office.google_maps_url ? () => window.open(office.google_maps_url, '_blank') : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityServicesPostOffices;
