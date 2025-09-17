import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, ArrowRight, Shield } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  description: string;
  type: string;
  available: boolean;
  station_id?: string;
  order_priority: number;
}
interface PoliceStation {
  id: string;
  name: string;
  area: string;
  address?: string;
  description?: string;
}
const PoliceStationDetails = () => {
  const navigate = useNavigate();
  const {
    stationId
  } = useParams<{
    stationId: string;
  }>();
  const [station, setStation] = useState<PoliceStation | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (stationId) {
      fetchStationData();
    }
  }, [stationId]);
  const fetchStationData = async () => {
    try {
      // Fetch police station details
      const {
        data: stationData,
        error: stationError
      } = await supabase.from('police_stations').select('*').eq('id', stationId).single();
      if (stationError) throw stationError;
      setStation(stationData);

      // Fetch emergency contacts for this station
      const {
        data: contactsData,
        error: contactsError
      } = await supabase.from('emergency_contacts').select('*').eq('station_id', stationId).eq('available', true).order('order_priority', {
        ascending: true
      });
      if (contactsError) throw contactsError;
      setContacts(contactsData || []);
    } catch (error) {
      console.error('Error fetching station data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };
  if (loading) {
    return <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري تحميل تفاصيل المركز...</p>
          </div>
        </div>
      </div>;
  }
  if (!station) {
    return <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-muted-foreground">لم يتم العثور على المركز</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{station.name}</h1>
          <p className="text-muted-foreground text-lg">{station.area}</p>
          {station.description && <p className="text-muted-foreground mt-2">{station.description}</p>}
        </div>

        {/* Back Button */}
        <div className="mb-6">
          
        </div>

        {/* Station Address */}
        {station.address && <GlassCard className="mb-6 text-center">
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-foreground">{station.address}</span>
            </div>
          </GlassCard>}

        {/* Emergency Contacts */}
        <div className="max-w-4xl mx-auto">
          {contacts.length === 0 ? <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد أرقام متاحة لهذا المركز</p>
            </div> : <div className="space-y-3">
              {contacts.map((contact, index) => <div key={contact.id} className="animate-fade-in" style={{
            animationDelay: `${index * 0.05}s`
          }}>
                  <GlassCard className="bg-card/90 border border-white/20 backdrop-blur-md hover:bg-card/95 transition-all duration-200 shadow-lg hover:shadow-elegant p-3">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left section - Contact info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {contact.title}
                          </h3>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                          {contact.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>24/7</span>
                          </div>
                          {contact.type && <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              <span className="capitalize">{contact.type}</span>
                            </div>}
                          {contact.order_priority > 0 && <span className="text-primary/70">أولوية {contact.order_priority}</span>}
                        </div>
                      </div>
                      
                      {/* Right section - Number and call button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                          {contact.number}
                        </div>
                        <Button onClick={() => handleCall(contact.number)} disabled={!contact.available} size="sm" className="bg-gradient-primary hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 py-2">
                          <Phone className="ml-1 h-3 w-3" />
                          {contact.available ? 'اتصال' : 'غير متاح'}
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </div>)}
            </div>}
        </div>
      </div>
    </div>;
};
export default PoliceStationDetails;