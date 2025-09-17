import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, MapPin, Phone, Clock, Star, Car, Accessibility, Languages, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  operating_hours: string;
  services: string[];
  languages: string[];
  parking_available: boolean;
  wheelchair_accessible: boolean;
  home_delivery: boolean;
  emergency_service: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  google_maps_url?: string;
}

const MedicalServicesPharmacies = () => {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setPharmacies(data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast.error('حدث خطأ أثناء تحميل الصيدليات');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleLocation = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getServiceLabel = (service: string) => {
    const serviceLabels: { [key: string]: string } = {
      'prescription': 'وصفات طبية',
      'otc': 'أدوية بدون وصفة',
      'consultation': 'استشارة صيدلانية',
      'delivery': 'توصيل منزلي',
      'emergency': 'خدمة طوارئ',
      'lab_tests': 'تحاليل طبية',
      'medical_supplies': 'مستلزمات طبية',
      'vaccination': 'تطعيمات'
    };
    return serviceLabels[service] || service;
  };

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = filterService === 'all' || pharmacy.services.includes(filterService);
    const matchesRating = filterRating === 'all' || pharmacy.rating >= parseInt(filterRating);
    
    return matchesSearch && matchesService && matchesRating;
  });

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
          <h1 className="text-2xl font-bold text-foreground">صيدليات</h1>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Input
              placeholder="البحث في الصيدليات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger>
              <SelectValue placeholder="نوع الخدمة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الخدمات</SelectItem>
              <SelectItem value="prescription">وصفات طبية</SelectItem>
              <SelectItem value="otc">أدوية بدون وصفة</SelectItem>
              <SelectItem value="consultation">استشارة صيدلانية</SelectItem>
              <SelectItem value="delivery">توصيل منزلي</SelectItem>
              <SelectItem value="emergency">خدمة طوارئ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger>
              <SelectValue placeholder="التقييم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التقييمات</SelectItem>
              <SelectItem value="4">4 نجوم فأكثر</SelectItem>
              <SelectItem value="3">3 نجوم فأكثر</SelectItem>
              <SelectItem value="2">2 نجوم فأكثر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pharmacies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد صيدليات متاحة حالياً</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredPharmacies.map((pharmacy) => (
              <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500 text-white">
                        <Pill className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{pharmacy.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {pharmacy.description || pharmacy.address}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{pharmacy.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{pharmacy.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">{pharmacy.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">{pharmacy.operating_hours}</span>
                    </div>
                  </div>

                  {/* Services */}
                  {pharmacy.services && pharmacy.services.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">الخدمات المتاحة:</h4>
                      <div className="flex flex-wrap gap-1">
                        {pharmacy.services.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {getServiceLabel(service)}
                          </Badge>
                        ))}
                        {pharmacy.services.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{pharmacy.services.length - 3} أخرى
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {pharmacy.parking_available && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Car className="h-3 w-3" />
                        <span>موقف</span>
                      </div>
                    )}
                    {pharmacy.wheelchair_accessible && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Accessibility className="h-3 w-3" />
                        <span>إمكانية وصول</span>
                      </div>
                    )}
                    {pharmacy.home_delivery && (
                      <div className="flex items-center gap-1 text-xs text-purple-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>توصيل منزلي</span>
                      </div>
                    )}
                    {pharmacy.emergency_service && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>طوارئ</span>
                      </div>
                    )}
                  </div>

                  {/* Languages */}
                  {pharmacy.languages && pharmacy.languages.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">اللغات:</h4>
                      <div className="flex flex-wrap gap-1">
                        {pharmacy.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleContact(pharmacy.phone)}
                      size="sm"
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      اتصل
                    </Button>
                    {pharmacy.google_maps_url && (
                      <Button
                        onClick={() => handleLocation(pharmacy.google_maps_url)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        الموقع
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalServicesPharmacies;
