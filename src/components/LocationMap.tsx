import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { MapPin, Navigation, Phone } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { serpApiService, SerpMapResult } from '@/services/serpApiService';
import { toast } from "sonner";

interface LocationMapProps {
  showNearbyStations?: boolean;
}

export const LocationMap: React.FC<LocationMapProps> = ({ showNearbyStations = true }) => {
  const { location } = useLocation();
  const [nearbyStations, setNearbyStations] = useState<SerpMapResult[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  useEffect(() => {
    if (location && showNearbyStations) {
      const fetchNearbyStations = async () => {
        setLoadingStations(true);
        try {
          const stations = await serpApiService.searchNearbyPoliceStations(
            location.latitude,
            location.longitude
          );
          setNearbyStations(stations);
          
          // Get current address
          const address = await serpApiService.reverseGeocode(
            location.latitude,
            location.longitude
          );
          // Address fetched but not used currently
        } catch (error) {
          console.error('Error fetching nearby stations:', error);
          toast.error('حدث خطأ في البحث عن مراكز الشرطة القريبة');
        } finally {
          setLoadingStations(false);
        }
      };

      fetchNearbyStations();
    }
  }, [location, showNearbyStations]);

  return (
    <div className="space-y-6">

      {/* Nearby Police Stations */}
      {showNearbyStations && location && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            مراكز الشرطة القريبة
          </h3>

          {loadingStations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="mr-2 text-muted-foreground">جاري البحث...</span>
            </div>
          ) : nearbyStations.length > 0 ? (
            <div className="space-y-4">
              {nearbyStations.slice(0, 5).map((station, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border/50 bg-background/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{station.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {station.address}
                      </p>
                      {station.rating && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-yellow-500">★</span>
                          <span className="text-xs text-muted-foreground mr-1">
                            {station.rating}
                          </span>
                        </div>
                      )}
                      {station.distance && (
                        <p className="text-xs text-muted-foreground mt-1">
                          المسافة: {station.distance}
                        </p>
                      )}
                    </div>
                    {station.phone && (
                      <Button
                        onClick={() => handleCall(station.phone!)}
                        variant="outline"
                        size="sm"
                        className="mr-2"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              لم يتم العثور على مراكز شرطة قريبة
            </p>
          )}
        </GlassCard>
      )}
    </div>
  );
};