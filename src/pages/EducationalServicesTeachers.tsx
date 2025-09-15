import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Phone, Mail, Star, DollarSign, Clock, Monitor, User, Users as UsersIcon, Award, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  subjects: string[];
  education_level: string;
  experience_years: number;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  image_url?: string;
  hourly_rate?: number;
  available_hours?: string;
  teaching_methods: string[];
  age_groups: string[];
  languages: string[];
  qualifications: string[];
  rating: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EducationalServicesTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل المدرسين',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEducationLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      diploma: 'دبلوم',
      bachelor: 'بكالوريوس',
      master: 'ماجستير',
      phd: 'دكتوراه'
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل المدرسين...</p>
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
            <Users className="h-12 w-12 text-purple-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">المدرسين</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل المدرسين والدروس الخصوصية</p>
        </div>


        {/* Teachers Grid */}
        {teachers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مدرسين</h3>
            <p className="text-gray-600">لا يوجد مدرسين متاحين حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {teacher.image_url ? (
                        <img
                          src={teacher.image_url}
                          alt={teacher.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{teacher.name}</CardTitle>
                          {teacher.is_verified && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <CardDescription>
                          <Badge variant="secondary">
                            {teacher.specialization}
                          </Badge>
                          <Badge variant="outline" className="mr-2">
                            {getEducationLevelLabel(teacher.education_level)}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(teacher.rating)}
                      <span className="text-sm text-gray-500">({teacher.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teacher.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{teacher.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {teacher.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{teacher.phone}</span>
                        </div>
                      )}
                      {teacher.hourly_rate && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{teacher.hourly_rate} جنيه/ساعة</span>
                        </div>
                      )}
                      {teacher.available_hours && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{teacher.available_hours}</span>
                        </div>
                      )}
                      {teacher.experience_years > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Award className="h-4 w-4" />
                          <span>{teacher.experience_years} سنوات خبرة</span>
                        </div>
                      )}
                    </div>

                    {/* Subjects */}
                    {teacher.subjects && teacher.subjects.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">المواد:</p>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Age Groups */}
                    {teacher.age_groups && teacher.age_groups.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">الفئات العمرية:</p>
                        <div className="flex flex-wrap gap-1">
                          {teacher.age_groups.map((ageGroup, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {ageGroup}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teaching Methods */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {teacher.teaching_methods.map((method, index) => {
                        const icons: Record<string, any> = {
                          'Online': Monitor,
                          'In-person': User,
                          'Group': UsersIcon,
                          'Individual': User
                        };
                        const Icon = icons[method] || User;
                        return (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Icon className="h-3 w-3 ml-1" />
                            {method}
                          </Badge>
                        );
                      })}
                    </div>

                    {/* Languages */}
                    {teacher.languages && teacher.languages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">اللغات:</p>
                        <div className="flex flex-wrap gap-1">
                          {teacher.languages.map((language, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Qualifications */}
                    {teacher.qualifications && teacher.qualifications.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">المؤهلات:</p>
                        <div className="flex flex-wrap gap-1">
                          {teacher.qualifications.map((qualification, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {qualification}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      {teacher.phone && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 ml-1" />
                          اتصل
                        </Button>
                      )}
                      {teacher.email && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Mail className="h-4 w-4 ml-1" />
                          إيميل
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

export default EducationalServicesTeachers;
