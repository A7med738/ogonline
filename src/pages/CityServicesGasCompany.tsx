import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Phone, MapPin, Clock, Calendar, AlertCircle, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GasCompany {
  id: string;
  name: string;
  description?: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  operating_hours?: string;
  services?: string[];
  image_url?: string;
  logo_url?: string;
  booking_url?: string;
}

const CityServicesGasCompany = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<GasCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('gas_company')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching gas company branches:', error);
      toast.error('حدث خطأ أثناء تحميل فروع شركة الغاز');
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

  const handleBooking = (bookingUrl?: string) => {
    if (bookingUrl) {
      window.open(bookingUrl, '_blank');
    } else {
      toast.info('رابط حجز الموعد غير متاح حالياً');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/city-services')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">شركة الغاز</h1>
            <p className="text-muted-foreground">فروع شركة الغاز وخدماتها</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">معلومات مهمة</h3>
                <p className="text-red-700 text-sm mt-1">
                  يمكنك الاتصال أو حجز موعد لخدمات الغاز. تأكد من إحضار المستندات المطلوبة.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branches Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل فروع شركة الغاز...</p>
            </div>
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد فروع متاحة</h3>
            <p className="text-muted-foreground">لم يتم إضافة أي فروع لشركة الغاز بعد</p>
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
                      <div className="p-2 rounded-lg bg-red-500 text-white">
                        <Flame className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {branch.description || 'فرع شركة الغاز'}
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
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{branch.phone}</span>
                    </div>
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
                    <Button
                      onClick={() => handleContact(branch.phone)}
                      size="sm"
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      اتصل
                    </Button>
                    <Button
                      onClick={() => handleLocation(branch.address, branch.google_maps_url, branch.latitude, branch.longitude)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      الموقع
                    </Button>
                  </div>
                  
                  {/* Booking Button */}
                  <Button
                    onClick={() => handleBooking(branch.booking_url)}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    حجز موعد
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityServicesGasCompany;
