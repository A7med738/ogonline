import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hospital, MapPin, Phone, Mail, Globe, Star, Users, DollarSign, Ambulance, Car, Pill, Microscope, X, Clock, Shield, Heart, Brain, Baby, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Hospital {
  id: string;
  name: string;
  type: string;
  level: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  google_maps_url?: string;
  established_year?: number;
  bed_capacity?: number;
  emergency_services: boolean;
  icu_available: boolean;
  surgery_available: boolean;
  pediatrics_available: boolean;
  maternity_available: boolean;
  cardiology_available: boolean;
  neurology_available: boolean;
  oncology_available: boolean;
  specialties?: string[];
  insurance_accepted?: string[];
  operating_hours?: string;
  emergency_phone?: string;
  ambulance_available: boolean;
  parking_available: boolean;
  pharmacy_available: boolean;
  lab_services: boolean;
  radiology_services: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MedicalServicesHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل المستشفيات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      public: 'حكومي',
      private: 'خاص',
      specialized: 'متخصص',
      university: 'جامعي'
    };
    return types[type] || type;
  };

  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      primary: 'أولي',
      secondary: 'ثانوي',
      tertiary: 'ثالثي',
      quaternary: 'رابعي'
    };
    return levels[level] || level;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل المستشفيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Hospital className="h-12 w-12 text-red-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">المستشفيات</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل المستشفيات والمراكز الطبية في المدينة</p>
        </div>

        {/* Hospitals Grid */}
        {hospitals.length === 0 ? (
          <div className="text-center py-12">
            <Hospital className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مستشفيات</h3>
            <p className="text-gray-600">لا توجد مستشفيات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-lg transition-shadow duration-300">
                {/* Hospital Image */}
                {hospital.image_url && (
                  <div className="aspect-video relative">
                    <img
                      src={hospital.image_url}
                      alt={hospital.name}
                      className="w-full h-full object-cover rounded-t-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {hospital.logo_url ? (
                        <img
                          src={hospital.logo_url}
                          alt={hospital.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Hospital className="h-6 w-6 text-red-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{hospital.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="secondary" className="mr-2">
                            {getTypeLabel(hospital.type)}
                          </Badge>
                          <Badge variant="outline">
                            {getLevelLabel(hospital.level)}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(hospital.rating)}
                      <span className="text-sm text-gray-500">({hospital.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hospital.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{hospital.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {hospital.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{hospital.address}</span>
                        </div>
                      )}
                      {hospital.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{hospital.phone}</span>
                        </div>
                      )}
                      {hospital.bed_capacity && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>السعة: {hospital.bed_capacity} سرير</span>
                        </div>
                      )}
                      {hospital.operating_hours && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{hospital.operating_hours}</span>
                        </div>
                      )}
                      {hospital.google_maps_url && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <a
                            href={hospital.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            عرض الموقع على خرائط جوجل
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Specialties */}
                    {hospital.specialties && hospital.specialties.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">التخصصات:</p>
                        <div className="flex flex-wrap gap-1">
                          {hospital.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {hospital.emergency_services && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 ml-1" />
                          طوارئ
                        </Badge>
                      )}
                      {hospital.icu_available && (
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 ml-1" />
                          عناية مركزة
                        </Badge>
                      )}
                      {hospital.surgery_available && (
                        <Badge variant="outline" className="text-xs">
                          <Stethoscope className="h-3 w-3 ml-1" />
                          جراحة
                        </Badge>
                      )}
                      {hospital.pediatrics_available && (
                        <Badge variant="outline" className="text-xs">
                          <Baby className="h-3 w-3 ml-1" />
                          أطفال
                        </Badge>
                      )}
                      {hospital.maternity_available && (
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 ml-1" />
                          نساء
                        </Badge>
                      )}
                      {hospital.cardiology_available && (
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 ml-1" />
                          قلب
                        </Badge>
                      )}
                      {hospital.neurology_available && (
                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 ml-1" />
                          أعصاب
                        </Badge>
                      )}
                      {hospital.oncology_available && (
                        <Badge variant="outline" className="text-xs">
                          <X className="h-3 w-3 ml-1" />
                          أورام
                        </Badge>
                      )}
                    </div>

                    {/* Additional Services */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {hospital.ambulance_available && (
                        <Badge variant="secondary" className="text-xs">
                          <Ambulance className="h-3 w-3 ml-1" />
                          إسعاف
                        </Badge>
                      )}
                      {hospital.parking_available && (
                        <Badge variant="secondary" className="text-xs">
                          <Car className="h-3 w-3 ml-1" />
                          موقف
                        </Badge>
                      )}
                      {hospital.pharmacy_available && (
                        <Badge variant="secondary" className="text-xs">
                          <Pill className="h-3 w-3 ml-1" />
                          صيدلية
                        </Badge>
                      )}
                      {hospital.lab_services && (
                        <Badge variant="secondary" className="text-xs">
                          <Microscope className="h-3 w-3 ml-1" />
                          مختبر
                        </Badge>
                      )}
                      {hospital.radiology_services && (
                        <Badge variant="secondary" className="text-xs">
                          <X className="h-3 w-3 ml-1" />
                          أشعة
                        </Badge>
                      )}
                    </div>

                    {/* Insurance */}
                    {hospital.insurance_accepted && hospital.insurance_accepted.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">التأمين المقبول:</p>
                        <div className="flex flex-wrap gap-1">
                          {hospital.insurance_accepted.map((insurance, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {insurance}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      {hospital.phone && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 ml-1" />
                          اتصل
                        </Button>
                      )}
                      {hospital.emergency_phone && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Shield className="h-4 w-4 ml-1" />
                          طوارئ
                        </Button>
                      )}
                      {hospital.website && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Globe className="h-4 w-4 ml-1" />
                          الموقع
                        </Button>
                      )}
                    </div>
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

export default MedicalServicesHospitals;
