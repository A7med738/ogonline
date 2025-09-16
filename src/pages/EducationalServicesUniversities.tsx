import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Phone, Mail, Globe, Star, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface University {
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
  accreditation?: string;
  faculties?: string[];
  programs?: string[];
  admission_requirements?: string[];
  tuition_fees?: {
    undergraduate?: number;
    graduate?: number;
  };
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EducationalServicesUniversities = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setUniversities(data || []);
    } catch (error) {
      console.error('Error loading universities:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الجامعات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      public: 'حكومية',
      private: 'خاصة',
      international: 'دولية',
      technical: 'تقنية',
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
          <p className="mt-4 text-lg text-gray-600">جاري تحميل الجامعات...</p>
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
            <Building2 className="h-12 w-12 text-blue-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">الجامعات</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اكتشف الجامعات والمعاهد العليا في مدينتك
          </p>
        </div>

        {/* Universities Grid */}
        {universities.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد جامعات</h3>
            <p className="text-gray-600">لا توجد جامعات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((university) => (
              <Card key={university.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {university.logo_url ? (
                        <img
                          src={university.logo_url}
                          alt={university.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{university.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="secondary">
                            {getTypeLabel(university.type)}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(university.rating)}
                      <span className="text-sm text-gray-500">({university.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {university.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{university.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {university.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{university.address}</span>
                        </div>
                      )}
                      {university.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{university.phone}</span>
                        </div>
                      )}
                      {university.established_year && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>تأسست عام {university.established_year}</span>
                        </div>
                      )}
                    </div>

                    {/* Faculties */}
                    {university.faculties && university.faculties.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">الكليات المتاحة</h4>
                        <div className="flex flex-wrap gap-1">
                          {university.faculties.slice(0, 3).map((faculty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {faculty}
                            </Badge>
                          ))}
                          {university.faculties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{university.faculties.length - 3} أخرى
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      {university.website && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={university.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-1" />
                            الموقع
                          </a>
                        </Button>
                      )}
                      {university.phone && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={`tel:${university.phone}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            اتصل
                          </a>
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

export default EducationalServicesUniversities;
