import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Phone, Mail, Globe, Star, Users, Clock, Microscope, X, Heart, Brain, Eye, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MedicalCenter {
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
  established_year?: number;
  capacity?: number;
  operating_hours?: string;
  services?: string[];
  equipment?: string[];
  specialties?: string[];
  appointment_required: boolean;
  walk_in_accepted: boolean;
  insurance_accepted?: string[];
  languages?: string[];
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MedicalServicesMedicalCenters = () => {
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMedicalCenters();
  }, []);

  const loadMedicalCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_centers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setMedicalCenters(data || []);
    } catch (error) {
      console.error('Error loading medical centers:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل المراكز الطبية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      diagnostic_center: 'مركز تشخيصي',
      imaging_center: 'مركز تصوير',
      laboratory: 'مختبر',
      rehabilitation_center: 'مركز تأهيل',
      dialysis_center: 'مركز غسيل كلى',
      cancer_center: 'مركز سرطان',
      cardiac_center: 'مركز قلب',
      eye_center: 'مركز عيون',
      dental_center: 'مركز أسنان',
      mental_health_center: 'مركز صحة نفسية',
      other: 'أخرى'
    };
    return types[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      diagnostic_center: Microscope,
      imaging_center: X,
      laboratory: Microscope,
      rehabilitation_center: Heart,
      dialysis_center: Heart,
      cancer_center: X,
      cardiac_center: Heart,
      eye_center: Eye,
      dental_center: Building2,
      mental_health_center: Brain,
      other: Building2
    };
    return icons[type] || Building2;
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل المراكز الطبية...</p>
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
            <Building2 className="h-12 w-12 text-purple-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">المراكز الطبية</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل المراكز الطبية المتخصصة والمرافق التشخيصية</p>
        </div>

        {/* Medical Centers Grid */}
        {medicalCenters.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراكز طبية</h3>
            <p className="text-gray-600">لا توجد مراكز طبية متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicalCenters.map((center) => {
              const TypeIcon = getTypeIcon(center.type);
              return (
                <Card key={center.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {center.logo_url ? (
                          <img
                            src={center.logo_url}
                            alt={center.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <TypeIcon className="h-6 w-6 text-purple-600" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{center.name}</CardTitle>
                          <CardDescription>
                            <Badge variant="secondary">
                              {getTypeLabel(center.type)}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(center.rating)}
                        <span className="text-sm text-gray-500">({center.rating})</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {center.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{center.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        {center.address && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{center.address}</span>
                          </div>
                        )}
                        {center.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{center.phone}</span>
                          </div>
                        )}
                        {center.capacity && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>السعة: {center.capacity}</span>
                          </div>
                        )}
                        {center.operating_hours && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{center.operating_hours}</span>
                          </div>
                        )}
                      </div>

                      {/* Services */}
                      {center.services && center.services.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">الخدمات:</p>
                          <div className="flex flex-wrap gap-1">
                            {center.services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Equipment */}
                      {center.equipment && center.equipment.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">المعدات:</p>
                          <div className="flex flex-wrap gap-1">
                            {center.equipment.map((equipment, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {equipment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specialties */}
                      {center.specialties && center.specialties.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">التخصصات:</p>
                          <div className="flex flex-wrap gap-1">
                            {center.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {center.languages && center.languages.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">اللغات:</p>
                          <div className="flex flex-wrap gap-1">
                            {center.languages.map((language, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Appointment Info */}
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-1">
                          {center.appointment_required ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-xs text-gray-600">
                            {center.appointment_required ? 'يحتاج موعد' : 'لا يحتاج موعد'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {center.walk_in_accepted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-xs text-gray-600">
                            {center.walk_in_accepted ? 'يقبل المراجعين المباشرين' : 'لا يقبل المراجعين المباشرين'}
                          </span>
                        </div>
                      </div>

                      {/* Insurance */}
                      {center.insurance_accepted && center.insurance_accepted.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">التأمين المقبول:</p>
                          <div className="flex flex-wrap gap-1">
                            {center.insurance_accepted.map((insurance, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {insurance}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-4">
                        {center.phone && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Phone className="h-4 w-4 ml-1" />
                            اتصل
                          </Button>
                        )}
                        {center.appointment_required && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Calendar className="h-4 w-4 ml-1" />
                            احجز موعد
                          </Button>
                        )}
                        {center.website && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Globe className="h-4 w-4 ml-1" />
                            الموقع
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalServicesMedicalCenters;
