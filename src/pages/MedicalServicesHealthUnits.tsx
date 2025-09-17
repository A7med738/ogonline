import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Phone, Mail, Globe, Star, Users, Clock, Shield, Baby, Users as UsersIcon, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthUnit {
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
  google_maps_url?: string;
  established_year?: number;
  capacity?: number;
  operating_hours?: string;
  services?: string[];
  target_groups?: string[];
  vaccination_available: boolean;
  family_planning: boolean;
  prenatal_care: boolean;
  child_health: boolean;
  chronic_disease_management: boolean;
  health_education: boolean;
  free_services: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MedicalServicesHealthUnits = () => {
  const [healthUnits, setHealthUnits] = useState<HealthUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHealthUnits();
  }, []);

  const loadHealthUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('health_units')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setHealthUnits(data || []);
    } catch (error) {
      console.error('Error loading health units:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الوحدات الصحية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      primary_health_center: 'مركز صحي أولي',
      family_medicine: 'طب الأسرة',
      community_health: 'صحة المجتمع',
      preventive_medicine: 'الطب الوقائي',
      maternal_child_health: 'صحة الأم والطفل',
      school_health: 'الصحة المدرسية',
      occupational_health: 'الصحة المهنية'
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل الوحدات الصحية...</p>
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
            <Heart className="h-12 w-12 text-green-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">الوحدات الصحية</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل الوحدات الصحية ومراكز الرعاية الأولية</p>
        </div>

        {/* Health Units Grid */}
        {healthUnits.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد وحدات صحية</h3>
            <p className="text-gray-600">لا توجد وحدات صحية متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthUnits.map((unit) => (
              <Card key={unit.id} className="hover:shadow-lg transition-shadow duration-300">
                {/* Health Unit Image */}
                {unit.image_url && (
                  <div className="aspect-video relative">
                    <img
                      src={unit.image_url}
                      alt={unit.name}
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
                      {unit.logo_url ? (
                        <img
                          src={unit.logo_url}
                          alt={unit.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{unit.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="secondary">
                            {getTypeLabel(unit.type)}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(unit.rating)}
                      <span className="text-sm text-gray-500">({unit.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {unit.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{unit.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {unit.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{unit.address}</span>
                        </div>
                      )}
                      {unit.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{unit.phone}</span>
                        </div>
                      )}
                      {unit.capacity && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>السعة: {unit.capacity} مريض يومياً</span>
                        </div>
                      )}
                      {unit.operating_hours && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{unit.operating_hours}</span>
                        </div>
                      )}
                      {unit.google_maps_url && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <a
                            href={unit.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            عرض الموقع على خرائط جوجل
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Services */}
                    {unit.services && unit.services.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">الخدمات:</p>
                        <div className="flex flex-wrap gap-1">
                          {unit.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Target Groups */}
                    {unit.target_groups && unit.target_groups.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">الفئات المستهدفة:</p>
                        <div className="flex flex-wrap gap-1">
                          {unit.target_groups.map((group, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {unit.vaccination_available && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 ml-1" />
                          تطعيم
                        </Badge>
                      )}
                      {unit.family_planning && (
                        <Badge variant="outline" className="text-xs">
                          <UsersIcon className="h-3 w-3 ml-1" />
                          تنظيم أسرة
                        </Badge>
                      )}
                      {unit.prenatal_care && (
                        <Badge variant="outline" className="text-xs">
                          <Baby className="h-3 w-3 ml-1" />
                          رعاية ما قبل الولادة
                        </Badge>
                      )}
                      {unit.child_health && (
                        <Badge variant="outline" className="text-xs">
                          <Baby className="h-3 w-3 ml-1" />
                          صحة الطفل
                        </Badge>
                      )}
                      {unit.chronic_disease_management && (
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 ml-1" />
                          إدارة الأمراض المزمنة
                        </Badge>
                      )}
                      {unit.health_education && (
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 ml-1" />
                          توعية صحية
                        </Badge>
                      )}
                    </div>

                    {/* Service Status */}
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-1">
                        {unit.free_services ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-xs text-gray-600">
                          {unit.free_services ? 'خدمات مجانية' : 'خدمات مدفوعة'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      {unit.phone && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 ml-1" />
                          اتصل
                        </Button>
                      )}
                      {unit.website && (
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

export default MedicalServicesHealthUnits;
