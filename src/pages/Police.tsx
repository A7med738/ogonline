import React, { useState, useEffect, useMemo } from 'react';
import { Phone, MapPin, Clock, ArrowRight, Shield, LogIn, Navigation, MoreHorizontal } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LocationMap } from "@/components/LocationMap";
import { openGoogleMapsDirections, hasValidLocation } from '@/utils/mapUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  latitude?: number;
  longitude?: number;
  show_location?: boolean;
  google_maps_url?: string;
}
const Police = () => {
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading
  } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        setIsAdmin(!!data);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user?.id]);
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .eq('role', 'admin')
          .single();
        setIsAdmin(!!data);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);
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

  // Combine all departments into unified cards
  const allDepartments = useMemo(() => {
    const stationCards = policeStations.map(station => {
      const stationContacts = emergencyContacts.filter(c => c.station_id === station.id && c.type !== 'emergency');
      const primaryContact = stationContacts.find(c => c.order_priority === 0) || stationContacts[0];
      
      return {
        id: station.id,
        type: 'station' as const,
        title: station.name,
        subtitle: station.area,
        description: station.description || 'مركز شرطة',
        address: station.address,
        primaryContact: primaryContact?.number || '',
        latitude: station.latitude,
        longitude: station.longitude,
        show_location: station.show_location,
        google_maps_url: station.google_maps_url,
        contacts: stationContacts
      };
    });

    const generalCards = emergencyContacts
      .filter(c => !c.station_id && c.type !== 'emergency')
      .map(contact => ({
        id: contact.id,
        type: 'contact' as const,
        title: contact.title,
        subtitle: contact.type,
        description: contact.description,
        address: '',
        primaryContact: contact.number,
        latitude: undefined,
        longitude: undefined,
        show_location: false,
        contacts: [contact]
      }));

    return [...stationCards, ...generalCards];
  }, [policeStations, emergencyContacts]);


  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };
  const handleStationClick = (stationId: string) => {
    navigate(`/police/station/${stationId}`);
  };
  const handleDeleteStation = async (id: string) => {
    try {
      const { error } = await supabase.from('police_stations').delete().eq('id', id);
      if (error) throw error;
      setPoliceStations(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error('Failed to delete station', e);
    }
  };
  const handleToggleStationLocation = async (station: PoliceStation) => {
    const next = station.show_location === false ? true : false;
    try {
      const { error } = await supabase.from('police_stations').update({ show_location: next } as any).eq('id', station.id);
      if (error) throw error;
      setPoliceStations(prev => prev.map(s => s.id === station.id ? { ...s, show_location: next } : s));
    } catch (e) {
      console.error('Failed to toggle location visibility', e);
    }
  };

  const handleGetDirections = (station: PoliceStation, event: React.MouseEvent) => {
    event.stopPropagation();
    if (hasValidLocation(station.latitude, station.longitude)) {
      openGoogleMapsDirections(
        station.latitude!,
        station.longitude!,
        `${station.name} - ${station.area}`
      );
    }
  };
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-primary/10 border border-primary/20 backdrop-blur-sm rounded-full p-6 w-32 h-32 mx-auto mb-4 flex items-center justify-center">
            <img src="/lovable-uploads/5f18772c-04fa-48a3-8d4d-67afd03b0db7.png" alt="شعار الشرطة المصرية" className="h-20 w-20 object-contain" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">شرطة المدينة</h3>
          
        </div>


        {/* Emergency Banner */}
        {emergencyContacts.find(c => c.type === 'emergency') && <GlassCard className="mb-6 border-red-500/30 bg-red-500/10">
            <div className="text-center">
              <div className="text-red-500 text-2xl font-bold mb-2">
                {emergencyContacts.find(c => c.type === 'emergency')?.number}
              </div>
              <p className="text-red-400 font-semibold">
                {emergencyContacts.find(c => c.type === 'emergency')?.title}
              </p>
              <Button onClick={() => handleCall(emergencyContacts.find(c => c.type === 'emergency')?.number || '')} className="mt-4 bg-red-600 hover:bg-red-700">
                <Phone className="ml-2 h-4 w-4" />
                اتصال طوارئ
              </Button>
            </div>
          </GlassCard>}


        {/* Authentication Check */}
        {authLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري التحقق من الهوية...</p>
          </div>
        ) : !user ? (
          <GlassCard className="text-center max-w-2xl mx-auto">
            <div className="py-8">
              <LogIn className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">تسجيل الدخول مطلوب</h2>
              <p className="text-muted-foreground mb-6">
                لعرض أرقام الطوارئ وتفاصيل الاتصال، يجب تسجيل الدخول أولاً لحماية معلومات الاتصال الحساسة.
              </p>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                <LogIn className="ml-2 h-4 w-4" />
                تسجيل الدخول
              </Button>
            </div>
          </GlassCard>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري تحميل أرقام الطوارئ...</p>
          </div>
        ) : allDepartments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              لا توجد أقسام متاحة حالياً
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Unified Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allDepartments.map((dept, index) => (
                <GlassCard 
                  key={dept.id} 
                  className="p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-elegant h-full"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Title & Subtitle */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {dept.title}
                    </h3>
                    <p className="text-sm text-primary font-medium">
                      {dept.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm text-center mb-4 line-clamp-2">
                    {dept.description}
                  </p>

                  {/* Address */}
                  {dept.address && (
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{dept.address}</span>
                    </div>
                  )}

                  {/* Primary Contact Number */}
                  {dept.primaryContact && (
                    <div className="text-center mb-4 p-3 bg-primary/10 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {dept.primaryContact}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        رقم التواصل الأساسي
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    {/* Call Button */}
                    {dept.primaryContact && (
                      <Button
                        onClick={() => handleCall(dept.primaryContact)}
                        size="sm"
                        className="flex-1 bg-gradient-primary hover:shadow-elegant"
                      >
                        <Phone className="ml-1 h-3 w-3" />
                        اتصال
                      </Button>
                    )}

                    {/* Map Button */}
                    {dept.latitude && dept.longitude && dept.show_location !== false && (
                      <Button
                        onClick={() => openGoogleMapsDirections(
                          Number(dept.latitude), 
                          Number(dept.longitude), 
                          dept.title
                        )}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-primary/20 hover:bg-primary/10"
                      >
                        <Navigation className="ml-1 h-3 w-3" />
                        خريطة
                      </Button>
                    )}

                    {/* Google Maps Link Button */}
                    {dept.type === 'station' && dept.google_maps_url && (
                      <Button
                        onClick={() => window.open(dept.google_maps_url, '_blank')}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-green-500/20 hover:bg-green-500/10"
                      >
                        <MapPin className="ml-1 h-3 w-3" />
                        الموقع
                      </Button>
                    )}

                    {/* More Button - for additional contacts */}
                    {dept.contacts.length > 1 && (
                      <Button
                        onClick={() => dept.type === 'station' && handleStationClick(dept.id)}
                        size="sm"
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/10"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Location and Map */}
        {user && <LocationMap showNearbyStations={true} />}
        
      </div>
    </div>;
};
export default Police;