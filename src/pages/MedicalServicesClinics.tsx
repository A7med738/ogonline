import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, MapPin, Phone, Mail, Globe, Star, DollarSign, Clock, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Clinic {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  doctor_name?: string;
  doctor_qualification?: string;
  doctor_specialization?: string;
  consultation_fee?: number;
  established_year?: number;
  operating_hours?: string;
  appointment_required: boolean;
  walk_in_accepted: boolean;
  insurance_accepted?: string[];
  services?: string[];
  equipment?: string[];
  languages?: string[];
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MedicalServicesClinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل العيادات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      general: 'عامة',
      specialized: 'متخصصة',
      dental: 'أسنان',
      dermatology: 'جلدية',
      ophthalmology: 'عيون',
      cardiology: 'قلب',
      neurology: 'أعصاب',
      orthopedics: 'عظام',
      pediatrics: 'أطفال',
      gynecology: 'نساء',
      psychiatry: 'نفسية',
      other: 'أخرى'
    };
    return types[type] || type;
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل العيادات...</p>
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
            <Stethoscope className="h-12 w-12 text-blue-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">العيادات</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل العيادات والمراكز الطبية المتخصصة</p>
        </div>

        {/* Clinics Grid */}
        {clinics.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عيادات</h3>
            <p className="text-gray-600">لا توجد عيادات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => (
              <Card key={clinic.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {clinic.logo_url ? (
                        <img
                          src={clinic.logo_url}
                          alt={clinic.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{clinic.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="secondary">
                            {getTypeLabel(clinic.type)}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(clinic.rating)}
                      <span className="text-sm text-gray-500">({clinic.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clinic.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{clinic.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {clinic.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{clinic.address}</span>
                        </div>
                      )}
                      {clinic.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{clinic.phone}</span>
                        </div>
                      )}
                      {clinic.consultation_fee && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>رسوم الاستشارة: {clinic.consultation_fee} جنيه</span>
                        </div>
                      )}
                      {clinic.operating_hours && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{clinic.operating_hours}</span>
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    {clinic.doctor_name && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">معلومات الطبيب</span>
                        </div>
                        <p className="text-sm text-gray-700">{clinic.doctor_name}</p>
                        {clinic.doctor_specialization && (
                          <p className="text-xs text-gray-600">{clinic.doctor_specialization}</p>
                        )}
                        {clinic.doctor_qualification && (
                          <p className="text-xs text-gray-600">{clinic.doctor_qualification}</p>
                        )}
                      </div>
                    )}

                    {/* Services */}
                    {clinic.services && clinic.services.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">الخدمات:</p>
                        <div className="flex flex-wrap gap-1">
                          {clinic.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Equipment */}
                    {clinic.equipment && clinic.equipment.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">المعدات:</p>
                        <div className="flex flex-wrap gap-1">
                          {clinic.equipment.map((equipment, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {equipment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {clinic.languages && clinic.languages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">اللغات:</p>
                        <div className="flex flex-wrap gap-1">
                          {clinic.languages.map((language, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Appointment Info */}
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-1">
                        {clinic.appointment_required ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-xs text-gray-600">
                          {clinic.appointment_required ? 'يحتاج موعد' : 'لا يحتاج موعد'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {clinic.walk_in_accepted ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-xs text-gray-600">
                          {clinic.walk_in_accepted ? 'يقبل المراجعين المباشرين' : 'لا يقبل المراجعين المباشرين'}
                        </span>
                      </div>
                    </div>

                    {/* Insurance */}
                    {clinic.insurance_accepted && clinic.insurance_accepted.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">التأمين المقبول:</p>
                        <div className="flex flex-wrap gap-1">
                          {clinic.insurance_accepted.map((insurance, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {insurance}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      {clinic.phone && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 ml-1" />
                          اتصل
                        </Button>
                      )}
                      {clinic.appointment_required && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="h-4 w-4 ml-1" />
                          احجز موعد
                        </Button>
                      )}
                      {clinic.website && (
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

export default MedicalServicesClinics;
