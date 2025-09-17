import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, MapPin, Clock, AlertCircle, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GasStation {
  id: string;
  name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  operating_hours?: string;
  services?: string[];
  image_url?: string;
  logo_url?: string;
}

const CityServicesGasStations = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('gas_stations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching gas stations:', error);
      toast.error('حدث خطأ أثناء تحميل محطات الوقود');
    } finally {
      setLoading(false);
    }
  };

  const handleLocation = (address: string, googleMapsUrl?: string, latitude?: number, longitude?: number) => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, '_blank');
    } else if (latitude && longitude) {
      window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">محطات الوقود</h1>
        </div>


        {/* Stations Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل محطات الوقود...</p>
            </div>
          </div>
        ) : stations.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد محطات وقود متاحة</h3>
            <p className="text-muted-foreground">لم يتم إضافة أي محطات وقود بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <Card key={station.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {station.logo_url ? (
                      <img 
                        src={station.logo_url} 
                        alt={station.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="p-2 rounded-lg bg-orange-500 text-white">
                        <Fuel className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{station.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {station.description || 'محطة وقود'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image */}
                  {station.image_url && (
                    <div className="w-full h-48 rounded-lg overflow-hidden">
                      <img 
                        src={station.image_url} 
                        alt={station.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{station.address}</span>
                  </div>

                  {/* Operating Hours */}
                  {station.operating_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{station.operating_hours}</span>
                    </div>
                  )}

                  {/* Services */}
                  {station.services && station.services.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">الخدمات المتاحة:</h4>
                      <div className="flex flex-wrap gap-1">
                        {station.services.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleLocation(station.address, station.google_maps_url, station.latitude, station.longitude)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      عرض الموقع على الخريطة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityServicesGasStations;
