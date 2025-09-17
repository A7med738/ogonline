import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Phone, MapPin, Clock, AlertCircle, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ElectricityCompany {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  operating_hours?: string;
  services?: string[];
  image_url?: string;
  logo_url?: string;
}

const CityServicesElectricityCompany = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<ElectricityCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('electricity_company')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching electricity company branches:', error);
      toast.error('حدث خطأ أثناء تحميل فروع شركة الكهرباء');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
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
          <h1 className="text-2xl font-bold text-foreground">شركة الكهرباء</h1>
        </div>


        {/* Branches Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل فروع شركة الكهرباء...</p>
            </div>
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد فروع متاحة</h3>
            <p className="text-muted-foreground">لم يتم إضافة أي فروع لشركة الكهرباء بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map((branch) => (
              <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {branch.logo_url ? (
                      <img 
                        src={branch.logo_url} 
                        alt={branch.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="p-2 rounded-lg bg-yellow-500 text-white">
                        <Zap className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {branch.description || 'فرع شركة الكهرباء'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image */}
                  {branch.image_url && (
                    <div className="w-full h-48 rounded-lg overflow-hidden">
                      <img 
                        src={branch.image_url} 
                        alt={branch.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2">
                    {branch.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{branch.phone}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{branch.address}</span>
                    </div>
                    {branch.operating_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{branch.operating_hours}</span>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  {branch.services && branch.services.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">الخدمات المتاحة:</h4>
                      <div className="flex flex-wrap gap-1">
                        {branch.services.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {branch.phone && (
                      <Button
                        onClick={() => handleContact(branch.phone!)}
                        size="sm"
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        اتصل
                      </Button>
                    )}
                    <Button
                      onClick={() => handleLocation(branch.address, branch.google_maps_url, branch.latitude, branch.longitude)}
                      variant="outline"
                      size="sm"
                      className={branch.phone ? "flex-1" : "w-full"}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      الموقع
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

export default CityServicesElectricityCompany;
