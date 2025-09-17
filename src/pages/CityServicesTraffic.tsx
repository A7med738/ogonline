import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Phone, MapPin, Clock, FileText, CreditCard, AlertCircle, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrafficService {
  id: string;
  name: string;
  description?: string;
  phone: string;
  address: string;
  operating_hours: string;
  services: string[];
  image_url?: string;
  logo_url?: string;
  google_maps_url?: string;
}

const CityServicesTraffic = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<TrafficService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('city_services_new')
        .select('*')
        .eq('service_type', 'traffic')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching traffic services:', error);
      toast.error('حدث خطأ أثناء تحميل خدمات المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleLocation = (service: TrafficService) => {
    if (service.google_maps_url) {
      window.open(service.google_maps_url, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(service.address)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">مرور</h1>
          <p className="text-muted-foreground">خدمات المرور والتراخيص</p>
        </div>

        {/* Emergency Notice */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">رقم الطوارئ المرورية</h3>
                <p className="text-orange-700 text-sm mt-1">
                  في حالة الحوادث أو الطوارئ المرورية: <strong>01234567899</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-8">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد خدمات مرور متاحة حالياً</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {service.logo_url ? (
                      <img
                        src={service.logo_url}
                        alt={service.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="p-2 rounded-lg bg-blue-500 text-white">
                        <Car className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {service.description || 'خدمة مرور'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Service Image */}
                  {service.image_url && (
                    <div className="w-full h-32 rounded-lg overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.operating_hours}</span>
                    </div>
                  </div>

                  {/* Services */}
                  {service.services && service.services.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">الخدمات المتاحة:</h4>
                      <div className="flex flex-wrap gap-1">
                        {service.services.map((serviceItem, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {serviceItem}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleContact(service.phone)}
                      size="sm"
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      اتصل
                    </Button>
                    <Button
                      onClick={() => handleLocation(service)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      الموقع
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">الخدمات الإلكترونية:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• تجديد رخصة القيادة إلكترونياً</li>
                  <li>• دفع المخالفات المرورية</li>
                  <li>• حجز موعد للفحص</li>
                  <li>• استعلام عن حالة الطلب</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">المستندات المطلوبة:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• الهوية الوطنية</li>
                  <li>• صورة شخصية</li>
                  <li>• شهادة صحية</li>
                  <li>• إيصال دفع الرسوم</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CityServicesTraffic;
