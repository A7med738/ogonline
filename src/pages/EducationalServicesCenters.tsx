import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, MapPin, Phone, Mail, Globe, Star, Users, DollarSign, Clock, Monitor, User, Users as UsersIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EducationalCenter {
  id: string;
  name: string;
  type: string;
  subjects: string[];
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
  class_schedule?: string;
  facilities?: string[];
  online_classes: boolean;
  individual_sessions: boolean;
  group_sessions: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EducationalServicesCenters = () => {
  const [centers, setCenters] = useState<EducationalCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('educational_centers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setCenters(data || []);
    } catch (error) {
      console.error('Error loading centers:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل المراكز التعليمية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      tutoring: 'دروس خصوصية',
      language: 'لغات',
      computer: 'كمبيوتر',
      art: 'فنون',
      music: 'موسيقى',
      sports: 'رياضة',
      religious: 'ديني',
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل المراكز التعليمية...</p>
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
            <BookOpen className="h-12 w-12 text-green-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">المراكز التعليمية</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل المراكز التعليمية ومراكز الدروس الخصوصية</p>
        </div>


        {/* Centers Grid */}
        {centers.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراكز تعليمية</h3>
            <p className="text-gray-600">لا توجد مراكز تعليمية متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center) => (
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
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-green-600" />
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
                      {center.fees_range && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{center.fees_range}</span>
                        </div>
                      )}
                      {center.class_schedule && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{center.class_schedule}</span>
                        </div>
                      )}
                      {center.capacity && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>السعة: {center.capacity}</span>
                        </div>
                      )}
                    </div>

                    {/* Subjects */}
                    {center.subjects && center.subjects.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">المواد:</p>
                        <div className="flex flex-wrap gap-1">
                          {center.subjects.map((subject, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Age Groups */}
                    {center.age_groups && center.age_groups.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">الفئات العمرية:</p>
                        <div className="flex flex-wrap gap-1">
                          {center.age_groups.map((ageGroup, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {ageGroup}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {center.online_classes && (
                        <Badge variant="outline" className="text-xs">
                          <Monitor className="h-3 w-3 ml-1" />
                          أونلاين
                        </Badge>
                      )}
                      {center.individual_sessions && (
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 ml-1" />
                          فردي
                        </Badge>
                      )}
                      {center.group_sessions && (
                        <Badge variant="outline" className="text-xs">
                          <UsersIcon className="h-3 w-3 ml-1" />
                          جماعي
                        </Badge>
                      )}
                    </div>

                    {/* Facilities */}
                    {center.facilities && center.facilities.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">المرافق:</p>
                        <div className="flex flex-wrap gap-1">
                          {center.facilities.map((facility, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {facility}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationalServicesCenters;
