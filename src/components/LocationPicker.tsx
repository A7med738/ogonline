import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { MapPin, Search, Navigation } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { serpApiService, SerpMapResult } from '@/services/serpApiService';
import { toast } from "sonner";

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (latitude: number, longitude: number, address?: string) => void;
  placeholder?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationSelect,
  placeholder = "ابحث عن موقع..."
}) => {
  const { location, loading: locationLoading, getCurrentLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SerpMapResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address?: string} | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await serpApiService.searchLocation(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('حدث خطأ في البحث عن الموقع');
    } finally {
      setSearching(false);
    }
  };

  const handleLocationSelect = (result: SerpMapResult) => {
    const lat = result.position.latitude;
    const lng = result.position.longitude;
    const address = result.address;
    
    setSelectedLocation({ lat, lng, address });
    onLocationSelect(lat, lng, address);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleCurrentLocation = () => {
    getCurrentLocation();
  };

  React.useEffect(() => {
    if (location) {
      setSelectedLocation({ lat: location.latitude, lng: location.longitude });
      onLocationSelect(location.latitude, location.longitude);
    }
  }, [location, onLocationSelect]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch} 
            disabled={searching || !searchQuery.trim()}
            variant="outline"
            size="icon"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={handleCurrentLocation}
          disabled={locationLoading}
          variant="outline"
          size="icon"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {selectedLocation && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <div className="font-medium">الموقع المحدد</div>
              <div className="text-muted-foreground">
                {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {searchResults.length > 0 && (
        <GlassCard className="p-4">
          <h4 className="font-medium mb-3">نتائج البحث</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {searchResults.slice(0, 5).map((result, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:bg-background/80 transition-colors"
                onClick={() => handleLocationSelect(result)}
              >
                <div className="font-medium text-sm">{result.title}</div>
                <div className="text-xs text-muted-foreground">{result.address}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {searching && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="mr-2 text-sm text-muted-foreground">جاري البحث...</span>
        </div>
      )}
    </div>
  );
};