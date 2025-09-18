import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GraduationCap, MapPin, Phone, Mail, Globe, Star, Users, DollarSign, Bus, Home, Heart, Search, Filter, Building2, Shield, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface School {
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
  established_year?: number;
  capacity?: number;
  fees_range?: string;
  curriculum?: string;
  languages?: string[];
  facilities?: string[];
  transportation: boolean;
  boarding: boolean;
  special_needs: boolean;
  rating: number;
  is_active: boolean;
  category_id?: string;
  created_at: string;
  updated_at: string;
  school_categories?: {
    id: string;
    name_ar: string;
    name_en: string;
    color: string;
    icon?: string;
  };
}

interface SchoolCategory {
  id: string;
  name_ar: string;
  name_en: string;
  color: string;
  icon?: string;
  is_active: boolean;
}

const EducationalServicesSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const { toast } = useToast();

  useEffect(() => {
    loadSchools();
    loadCategories();
  }, []);

  useEffect(() => {
    filterAndSortSchools();
  }, [schools, searchTerm, selectedType, sortBy]);

  const loadSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          school_categories (
            id,
            name_ar,
            name_en,
            color,
            icon
          )
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل المدارس',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('school_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterAndSortSchools = () => {
    let filtered = [...schools];

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب النوع
    if (selectedType !== 'all') {
      filtered = filtered.filter(school => school.type === selectedType);
    }

    // ترتيب النتائج
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'capacity':
          return (b.capacity || 0) - (a.capacity || 0);
        default:
          return 0;
      }
    });

    setFilteredSchools(filtered);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      public: 'حكومية',
      private: 'خاصة',
      national: 'وطنية',
      international: 'دولية'
    };
    return types[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      public: Building2,
      private: Crown,
      national: Shield,
      international: GraduationCap
    };
    return icons[type] || GraduationCap;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      public: 'bg-blue-100 text-blue-800 border-blue-200',
      private: 'bg-purple-100 text-purple-800 border-purple-200',
      national: 'bg-green-100 text-green-800 border-green-200',
      international: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      kindergarten: 'روضة',
      primary: 'ابتدائي',
      preparatory: 'إعدادي',
      secondary: 'ثانوي',
      all: 'جميع المراحل'
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل المدارس...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <GraduationCap className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 ml-2 sm:ml-4" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">المدارس</h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg">اكتشف أفضل المدارس في المدينة</p>
        </div>

        {/* School Type Categories */}
        <div className="mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">اختر نوع المدرسة</h2>
            <p className="text-sm sm:text-base text-gray-600">اكتشف المدارس حسب نوعها</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {['public', 'private', 'national'].map((type) => {
              const Icon = getTypeIcon(type);
              const label = getTypeLabel(type);
              const color = getTypeColor(type);
              const count = schools.filter(s => s.type === type).length;
              
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? 'all' : type)}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                    selectedType === type
                      ? `${color} border-current shadow-md`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`mx-auto mb-1 sm:mb-2 p-1 sm:p-1.5 rounded-full ${
                      selectedType === type ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-3 w-3 sm:h-4 sm:w-4 mx-auto ${
                        selectedType === type ? 'text-current' : 'text-gray-600'
                      }`} />
                    </div>
                    <h3 className={`text-xs sm:text-sm font-bold mb-1 ${
                      selectedType === type ? 'text-current' : 'text-gray-900'
                    }`}>
                      {label}
                    </h3>
                    <p className={`text-xs ${
                      selectedType === type ? 'text-current/80' : 'text-gray-600'
                    }`}>
                      {count}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>



        {/* Schools Grid */}
        {filteredSchools.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {schools.length === 0 ? 'لا توجد مدارس' : 'لا توجد نتائج'}
            </h3>
            <p className="text-gray-600">
              {schools.length === 0 ? 'لا توجد مدارس متاحة حالياً' : 'جرب تغيير معايير البحث'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSchools.map((school) => (
              <Card key={school.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {school.logo_url ? (
                        <img
                          src={school.logo_url}
                          alt={school.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{school.name}</CardTitle>
                        <CardDescription>
                          <div className="flex flex-wrap gap-2">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(school.type)}`}>
                              {React.createElement(getTypeIcon(school.type), { className: "h-3 w-3 ml-1" })}
                              {getTypeLabel(school.type)}
                            </div>
                            <Badge variant="outline">
                              {getLevelLabel(school.level)}
                            </Badge>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(school.rating)}
                      <span className="text-sm text-gray-500">({school.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {school.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{school.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {school.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{school.address}</span>
                        </div>
                      )}
                      {school.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{school.phone}</span>
                        </div>
                      )}
                      {school.fees_range && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{school.fees_range}</span>
                        </div>
                      )}
                      {school.capacity && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>السعة: {school.capacity}</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {school.transportation && (
                        <Badge variant="outline" className="text-xs">
                          <Bus className="h-3 w-3 ml-1" />
                          نقل مدرسي
                        </Badge>
                      )}
                      {school.boarding && (
                        <Badge variant="outline" className="text-xs">
                          <Home className="h-3 w-3 ml-1" />
                          إقامة داخلية
                        </Badge>
                      )}
                      {school.special_needs && (
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 ml-1" />
                          احتياجات خاصة
                        </Badge>
                      )}
                    </div>

                    {/* Languages */}
                    {school.languages && school.languages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">اللغات:</p>
                        <div className="flex flex-wrap gap-1">
                          {school.languages.map((lang, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      {school.phone && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 ml-1" />
                          اتصل
                        </Button>
                      )}
                      {school.website && (
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

export default EducationalServicesSchools;
