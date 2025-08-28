import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, ArrowRight, Shield } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  description: string;
  type: string;
  available: boolean;
  station_id?: string;
}
interface PoliceStation {
  id: string;
  name: string;
  area: string;
  address?: string;
  description?: string;
}
const Police = () => {
  const navigate = useNavigate();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      // Fetch police stations
      const {
        data: stationsData,
        error: stationsError
      } = await supabase.from('police_stations').select('*').order('area', {
        ascending: true
      });
      if (stationsError) throw stationsError;
      setPoliceStations(stationsData || []);

      // Fetch emergency contacts
      const {
        data: contactsData,
        error: contactsError
      } = await supabase.from('emergency_contacts').select('*').eq('available', true).order('order_priority', {
        ascending: true
      });
      if (contactsError) throw contactsError;
      setEmergencyContacts(contactsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  const scrollToSection = (stationId: string) => {
    const element = document.getElementById(`station-contacts-${stationId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };
  return <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">أرقام الشرطة</h1>
          <p className="text-white/80 text-lg">
            أرقام التواصل مع مركز الشرطة للطوارئ والخدمات
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/')} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        {/* Emergency Banner */}
        {emergencyContacts.find(c => c.type === 'emergency') && (
          <GlassCard className="mb-6 border-red-500/30 bg-red-500/10">
            <div className="text-center">
              <div className="text-red-500 text-2xl font-bold mb-2">
                {emergencyContacts.find(c => c.type === 'emergency')?.number}
              </div>
              <p className="text-red-400 font-semibold">
                {emergencyContacts.find(c => c.type === 'emergency')?.title}
              </p>
              <Button 
                onClick={() => handleCall(emergencyContacts.find(c => c.type === 'emergency')?.number || '')}
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                <Phone className="ml-2 h-4 w-4" />
                اتصال طوارئ
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Police Numbers Grid */}
        {loading ? <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-white/80">جاري تحميل أرقام الطوارئ...</p>
          </div> : emergencyContacts.length === 0 ? <div className="text-center py-8">
            <p className="text-white/80">لا توجد أرقام طوارئ متاحة حالياً</p>
          </div> : policeStations.length === 0 ? <div className="text-center py-8">
            <p className="text-white/80">لا توجد مراكز شرطة متاحة حالياً</p>
          </div> : <div className="space-y-8 max-w-4xl mx-auto">
            {policeStations.map((station, stationIndex) => {
          const stationContacts = emergencyContacts.filter(c => c.station_id === station.id && c.type !== 'emergency');
          return <div key={station.id} className="animate-slide-up" style={{
            animationDelay: `${stationIndex * 0.1}s`
          }}>
                  {/* Station Header */}
                  <GlassCard 
                    className="mb-4 cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-elegant"
                    onClick={() => scrollToSection(station.id)}
                  >
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-foreground mb-2">{station.name}</h2>
                      <p className="text-lg text-primary font-semibold mb-2">{station.area}</p>
                      {station.description && <p className="text-muted-foreground mb-2">{station.description}</p>}
                      {station.address && <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{station.address}</span>
                        </div>}
                      <p className="text-xs text-muted-foreground/70 mt-2">اضغط للانتقال إلى أرقام المركز</p>
                    </div>
                  </GlassCard>

                  {/* Station Contacts */}
                  {stationContacts.length > 0 ? <div id={`station-contacts-${station.id}`} className="grid gap-4">
                      {stationContacts.map((contact, contactIndex) => <GlassCard key={contact.id} className="hover:scale-[1.02] transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-foreground mb-2">
                                {contact.title}
                              </h3>
                              <p className="text-muted-foreground mb-2">
                                {contact.description}
                              </p>
                              <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>متاح على مدار الساعة</span>
                              </div>
                            </div>
                            
                            <div className="text-left">
                              <div className="text-2xl font-bold text-primary mb-2">
                                {contact.number}
                              </div>
                              <Button onClick={() => handleCall(contact.number)} className="bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                                <Phone className="ml-2 h-4 w-4" />
                                اتصال
                              </Button>
                            </div>
                          </div>
                        </GlassCard>)}
                    </div> : <div className="text-center py-4">
                      <p className="text-white/60">لا توجد أرقام متاحة لهذا المركز</p>
                    </div>}
                </div>;
        })}

            {/* General contacts without station */}
            {emergencyContacts.filter(c => !c.station_id && c.type !== 'emergency').length > 0 && <div className="animate-slide-up">
                <GlassCard className="mb-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">أرقام عامة</h2>
                    <p className="text-muted-foreground">أرقام لا تتبع لمركز محدد</p>
                  </div>
                </GlassCard>

                <div className="grid gap-4">
                  {emergencyContacts.filter(c => !c.station_id && c.type !== 'emergency').map(contact => <GlassCard key={contact.id} className="hover:scale-[1.02] transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {contact.title}
                          </h3>
                          <p className="text-muted-foreground mb-2">
                            {contact.description}
                          </p>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>متاح على مدار الساعة</span>
                          </div>
                        </div>
                        
                        <div className="text-left">
                          <div className="text-2xl font-bold text-primary mb-2">
                            {contact.number}
                          </div>
                          <Button onClick={() => handleCall(contact.number)} className="bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                            <Phone className="ml-2 h-4 w-4" />
                            اتصال
                          </Button>
                        </div>
                      </div>
                    </GlassCard>)}
                </div>
              </div>}
          </div>}

        {/* Location Info */}
        <GlassCard className="mt-8 max-w-4xl mx-auto animate-fade-in">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">موقع المركز الرئيسي</h3>
            <p className="text-muted-foreground">
              شارع الملك فهد - حي الوزارات - صندوق بريد 1234
            </p>
          </div>
        </GlassCard>
      </div>
    </div>;
};
export default Police;