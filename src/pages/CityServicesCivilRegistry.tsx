import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Phone, MapPin, Clock, User, CreditCard, AlertCircle, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CivilRegistryService {
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

const CityServicesCivilRegistry = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<CivilRegistryService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('city_services_new')
        .select('*')
        .eq('service_type', 'civil_registry')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching civil registry services:', error);
      toast.error('حدث خطأ أثناء تحميل خدمات السجل المدني');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleLocation = (address: string, googleMapsUrl?: string) => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
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
            <h1 className="text-2xl font-bold text-foreground">سجل مدني</h1>
            <p className="text-muted-foreground">خدمات السجل المدني والهوية</p>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800">معلومات مهمة</h3>
                <p className="text-blue-700 text-sm mt-1">
                  جميع الخدمات تتطلب الهوية الوطنية الأصلية. يرجى إحضار المستندات المطلوبة.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">جاري تحميل الخدمات...</p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد خدمات متاحة</h3>
            <p className="text-muted-foreground">لم يتم إضافة أي خدمات للسجل المدني بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {service.logo_url ? (
                      <img 
                        src={service.logo_url} 
                        alt={service.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="p-2 rounded-lg bg-blue-500 text-white">
                        <FileText className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {service.description || 'خدمة السجل المدني'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image */}
                  {service.image_url && (
                    <div className="w-full h-48 rounded-lg overflow-hidden">
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
                      onClick={() => handleLocation(service.address, service.google_maps_url)}
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
            ))}
          </div>
        )}

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
                  <li>• استخراج شهادات الميلاد والوفاة</li>
                  <li>• تجديد الهوية الوطنية</li>
                  <li>• حجز موعد للخدمات</li>
                  <li>• متابعة حالة الطلبات</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">المستندات المطلوبة:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• الهوية الوطنية</li>
                  <li>• صورة شخصية حديثة</li>
                  <li>• إثبات العنوان</li>
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

export default CityServicesCivilRegistry;
