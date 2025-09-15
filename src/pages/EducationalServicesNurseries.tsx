import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Baby, MapPin, Phone, Mail, Globe, Star, Users, DollarSign, Clock, Bus, Utensils, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Nursery {
  id: string;
  name: string;
  type: string;
  age_groups: string[];
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  capacity?: number;
  fees_range?: string;
  operating_hours?: string;
  facilities?: string[];
  transportation: boolean;
  meals_included: boolean;
  medical_care: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EducationalServicesNurseries = () => {
  const [nurseries, setNurseries] = useState<Nursery[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNurseries();
  }, []);

  const loadNurseries = async () => {
    try {
      const { data, error } = await supabase
        .from('nurseries')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setNurseries(data || []);
    } catch (error) {
      console.error('Error loading nurseries:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الحضانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      private: 'خاصة',
      government: 'حكومية',
      community: 'مجتمعية'
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل الحضانات...</p>
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
            <Baby className="h-12 w-12 text-pink-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">الحضانات</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل الحضانات ومراكز رعاية الأطفال</p>
        </div>


        {/* Nurseries Grid */}
        {nurseries.length === 0 ? (
          <div className="text-center py-12">
            <Baby className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حضانات</h3>
            <p className="text-gray-600">لا توجد حضانات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nurseries.map((nursery) => (
              <Card key={nursery.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {nursery.logo_url ? (
                        <img
                          src={nursery.logo_url}
                          alt={nursery.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                          <Baby className="h-6 w-6 text-pink-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{nursery.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="secondary">
                            {getTypeLabel(nursery.type)}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(nursery.rating)}
                      <span className="text-sm text-gray-500">({nursery.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nursery.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{nursery.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {nursery.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{nursery.address}</span>
                        </div>
                      )}
                      {nursery.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{nursery.phone}</span>
                        </div>
                      )}
                      {nursery.fees_range && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{nursery.fees_range}</span>
                        </div>
                      )}
                      {nursery.operating_hours && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{nursery.operating_hours}</span>
                        </div>
                      )}
                      {nursery.capacity && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>السعة: {nursery.capacity}</span>
                        </div>
                      )}
                    </div>

                    {/* Age Groups */}
                    {nursery.age_groups && nursery.age_groups.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">الفئات العمرية:</p>
                        <div className="flex flex-wrap gap-1">
                          {nursery.age_groups.map((ageGroup, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ageGroup}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {nursery.transportation && (
                        <Badge variant="outline" className="text-xs">
                          <Bus className="h-3 w-3 ml-1" />
                          نقل
                        </Badge>
                      )}
                      {nursery.meals_included && (
                        <Badge variant="outline" className="text-xs">
                          <Utensils className="h-3 w-3 ml-1" />
                          وجبات
                        </Badge>
                      )}
                      {nursery.medical_care && (
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 ml-1" />
                          رعاية طبية
                        </Badge>
                      )}
                    </div>

                    {/* Facilities */}
                    {nursery.facilities && nursery.facilities.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">المرافق:</p>
                        <div className="flex flex-wrap gap-1">
                          {nursery.facilities.map((facility, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      {nursery.phone && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 ml-1" />
                          اتصل
                        </Button>
                      )}
                      {nursery.website && (
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

export default EducationalServicesNurseries;
