import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, MapPin, Phone, Mail, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Craftsman {
  id: string;
  name: string;
  profession: string;
  specialization: string;
  experience_years: number;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  image_url?: string;
  services: string[];
  working_hours?: string;
  rating: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CityServicesCraftsmen = () => {
  const [craftsmen, setCraftsmen] = useState<Craftsman[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState('all');
  const { toast } = useToast();

  const professions = [
    { value: 'all', label: 'جميع المهن' },
    { value: 'plumber', label: 'سباك' },
    { value: 'electrician', label: 'كهربائي' },
    { value: 'carpenter', label: 'نجار' },
    { value: 'painter', label: 'دهان' },
    { value: 'mechanic', label: 'ميكانيكي' },
    { value: 'welder', label: 'لحام' },
    { value: 'mason', label: 'بناء' },
    { value: 'tiler', label: 'بلاط' },
    { value: 'other', label: 'أخرى' }
  ];

  useEffect(() => {
    loadCraftsmen();
  }, [selectedProfession]);

  const loadCraftsmen = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('craftsmen')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (selectedProfession !== 'all') {
        query = query.eq('profession', selectedProfession);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCraftsmen(data || []);
    } catch (error) {
      console.error('Error loading craftsmen:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الصنايعية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProfessionLabel = (profession: string) => {
    const prof = professions.find(p => p.value === profession);
    return prof ? prof.label : profession;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredCraftsmen = selectedProfession === 'all' 
    ? craftsmen 
    : craftsmen.filter(craftsman => craftsman.profession === selectedProfession);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل الصنايعية...</p>
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
            <Wrench className="h-12 w-12 text-blue-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">الصنايعية</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ابحث عن الصنايعية والحرفيين المهرة في مدينتك
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {professions.map((profession) => (
              <Button
                key={profession.value}
                variant={selectedProfession === profession.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProfession(profession.value)}
                className="mb-2"
              >
                {profession.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Craftsmen Grid */}
        {filteredCraftsmen.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد صنايعية</h3>
            <p className="text-gray-600">
              {selectedProfession === 'all' 
                ? 'لا توجد صنايعية متاحة حالياً' 
                : `لا توجد صنايعية في مجال ${getProfessionLabel(selectedProfession)}`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCraftsmen.map((craftsman) => (
              <Card key={craftsman.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {craftsman.image_url ? (
                        <img
                          src={craftsman.image_url}
                          alt={craftsman.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{craftsman.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="secondary" className="mr-2">
                            {getProfessionLabel(craftsman.profession)}
                          </Badge>
                          {craftsman.is_verified && (
                            <Badge variant="default" className="bg-green-600">
                              معتمد
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(craftsman.rating)}
                      <span className="text-sm text-gray-500">({craftsman.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {craftsman.specialization && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">التخصص: </span>
                        <span>{craftsman.specialization}</span>
                      </div>
                    )}
                    
                    {craftsman.experience_years > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">الخبرة: </span>
                        <span>{craftsman.experience_years} سنة</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      {craftsman.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{craftsman.address}</span>
                        </div>
                      )}
                      {craftsman.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{craftsman.phone}</span>
                        </div>
                      )}
                      {craftsman.working_hours && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{craftsman.working_hours}</span>
                        </div>
                      )}
                    </div>

                    {/* Services */}
                    {craftsman.services && craftsman.services.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">الخدمات المتاحة</h4>
                        <div className="flex flex-wrap gap-1">
                          {craftsman.services.slice(0, 3).map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {craftsman.services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{craftsman.services.length - 3} أخرى
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      {craftsman.phone && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={`tel:${craftsman.phone}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            اتصل
                          </a>
                        </Button>
                      )}
                      {craftsman.email && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={`mailto:${craftsman.email}`}>
                            <Mail className="h-4 w-4 mr-1" />
                            إيميل
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

export default CityServicesCraftsmen;
