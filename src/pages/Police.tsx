import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, ArrowRight, Shield, LogIn, Navigation, Trash2 } from "lucide-react";
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
  const [openStations, setOpenStations] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);
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
      const { error } = await supabase.from('police_stations').update({ show_location: next }).eq('id', station.id);
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
          <div className="bg-primary/10 border border-primary/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary" />
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
        {authLoading ? <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري التحقق من الهوية...</p>
          </div> : !user ? <GlassCard className="text-center max-w-2xl mx-auto">
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
          </GlassCard> : loading ? <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري تحميل أرقام الطوارئ...</p>
          </div> : emergencyContacts.length === 0 ? <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد أرقام طوارئ متاحة حالياً</p>
          </div> : policeStations.length === 0 ? <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد مراكز شرطة متاحة حالياً</p>
          </div> : <div className="space-y-8 max-w-4xl mx-auto">
            {policeStations.map((station, stationIndex) => {
          const stationContacts = emergencyContacts.filter(c => c.station_id === station.id && c.type !== 'emergency');
          return <div key={station.id} className="animate-slide-up" style={{
            animationDelay: `${stationIndex * 0.1}s`
          }}>
                  {/* Station Header */}
                  <GlassCard id={`station-header-${station.id}`} className="mb-4 hover:scale-[1.02] transition-all duration-300 hover:shadow-elegant hover:bg-white/20">
                    <div className="text-center">
                      <div className="flex justify-end gap-1">
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف مركز الشرطة</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف "{station.name} - {station.area}"؟ هذا الإجراء لا يمكن التراجع عنه.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteStation(station.id)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {/* Location visibility toggle moved to Admin panel */}
                      </div>
                      <div className="cursor-pointer" onClick={() => handleStationClick(station.id)}>
                      <h2 className="text-2xl font-bold text-foreground mb-2">{station.name}</h2>
                      <p className="text-lg text-primary font-semibold mb-2">{station.area}</p>
                      {station.description && <p className="text-foreground/90 mb-2">{station.description}</p>}
                      {station.address && <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{station.address}</span>
                        </div>}
                      </div>
                      
                      {/* Directions Button */}
                      {hasValidLocation(station.latitude, station.longitude) && (station.show_location !== false) && (
                        <div className="mt-4">
                          <Button
                            onClick={(e) => handleGetDirections(station, e)}
                            variant="outline"
                            size="sm"
                            className="border-primary/20 hover:bg-primary/10"
                          >
                            <Navigation className="ml-2 h-4 w-4" />
                            موقع
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-xs text-primary/80 mt-2 animate-pulse">
                        👆 اضغط لعرض أرقام المركز
                      </p>
                    </div>
                  </GlassCard>

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

                <div className="relative z-10 grid gap-4">
                  {emergencyContacts.filter(c => !c.station_id && c.type !== 'emergency').map(contact => <div key={contact.id} className="max-w-4xl mx-auto">
                    <GlassCard className="bg-card/95 border border-white/15 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 shadow-elegant">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-foreground">
                              {contact.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${contact.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {contact.available ? 'متاح' : 'غير متاح'}
                            </span>
                          </div>
                          
                          <p className="text-muted-foreground mb-2">
                            {contact.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Clock className="h-4 w-4" />
                              <span>متاح على مدار الساعة</span>
                            </div>
                            {contact.type && <div className="flex items-center space-x-2 space-x-reverse">
                                <Shield className="h-4 w-4" />
                                <span className="capitalize">{contact.type}</span>
                              </div>}
                          </div>
                          
                          {contact.order_priority > 0 && <div className="text-xs text-primary/70">
                              أولوية: {contact.order_priority}
                            </div>}
                        </div>
                        
                        <div className="text-left">
                          <div className="text-2xl font-bold text-primary mb-2">
                            {contact.number}
                          </div>
                          <Button onClick={() => handleCall(contact.number)} disabled={!contact.available} className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Phone className="ml-2 h-4 w-4" />
                            {contact.available ? 'اتصال' : 'غير متاح'}
                          </Button>
                        </div>
                      </div>
                     </GlassCard>
                   </div>)}
                </div>
              </div>}
          </div>}

        {/* Location and Map */}
        {user && <LocationMap showNearbyStations={true} />}
        
      </div>
    </div>;
};
export default Police;