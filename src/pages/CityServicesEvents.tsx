import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModernServiceCard } from '@/components/ModernServiceCard';
import { Calendar, MapPin, Phone, Mail, Clock, DollarSign, Users, CheckCircle, XCircle, Languages, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  venue?: string;
  address?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  organizer?: string;
  organizer_phone?: string;
  organizer_email?: string;
  image_url?: string;
  ticket_price?: number;
  is_free: boolean;
  age_restriction?: string;
  capacity?: number;
  registration_required: boolean;
  registration_deadline?: string;
  languages?: string[];
  tags?: string[];
  is_active: boolean;
  google_maps_url?: string;
  created_at: string;
  updated_at: string;
}

const CityServicesEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الفعاليات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      sports: 'رياضي',
      cultural: 'ثقافي',
      educational: 'تعليمي',
      entertainment: 'ترفيهي',
      religious: 'ديني',
      community: 'مجتمعي',
      business: 'تجاري',
      art: 'فني',
      music: 'موسيقي',
      other: 'أخرى'
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل الفعاليات...</p>
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
            <Calendar className="h-12 w-12 text-orange-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">الفعاليات والأنشطة</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أحدث الفعاليات والأنشطة في المدينة</p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فعاليات</h3>
            <p className="text-gray-600">لا توجد فعاليات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <ModernServiceCard
                key={event.id}
                id={event.id}
                name={event.title}
                subtitle={event.description}
                type={getTypeLabel(event.event_type)}
                rating={0}
                address={event.venue}
                phone={event.organizer_phone}
                icon={<Calendar className="h-6 w-6 text-orange-600" />}
                features={[
                  {
                    label: "يحتاج تسجيل",
                    available: event.registration_required || false
                  },
                  {
                    label: "مجاني",
                    available: !event.ticket_price || event.ticket_price === 0
                  },
                  {
                    label: "لغات متعددة",
                    available: !!(event.languages && event.languages.length > 0)
                  }
                ]}
                membershipInfo={[
                  {
                    label: "سعة محدودة",
                    available: !!(event.capacity && event.capacity > 0)
                  },
                  {
                    label: "عمر محدد",
                    available: !!event.age_restriction
                  }
                ]}
                onViewLocation={event.google_maps_url ? () => window.open(event.google_maps_url, '_blank') : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityServicesEvents;
