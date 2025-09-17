import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GraduationCap, MapPin, Phone, Mail, Globe, Star, Users, DollarSign, Bus, Home, Heart, Search, Filter } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const { toast } = useToast();

  useEffect(() => {
    loadSchools();
    loadCategories();
  }, []);

  useEffect(() => {
    filterAndSortSchools();
  }, [schools, searchTerm, selectedCategory, sortBy]);

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

    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(school => school.category_id === selectedCategory);
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
      international: 'دولية',
      religious: 'دينية'
    };
    return types[type] || type;
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600 ml-4" />
            <h1 className="text-4xl font-bold text-gray-900">المدارس</h1>
          </div>
          <p className="text-gray-600 text-lg">اكتشف أفضل المدارس في المدينة</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 ml-2" />
            <h3 className="text-lg font-semibold text-gray-900">فلترة وترتيب المدارس</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* البحث */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">البحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن مدرسة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* فلترة حسب الفئة */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">نوع المدرسة</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المدرسة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span>{category.name_ar}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ترتيب النتائج */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">ترتيب حسب</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">التقييم</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                  <SelectItem value="capacity">السعة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* إحصائيات */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">النتائج</label>
              <div className="bg-gray-50 rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredSchools.length}</div>
                <div className="text-sm text-gray-600">مدرسة</div>
              </div>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            {school.school_categories && (
                              <Badge 
                                variant="secondary" 
                                className="mr-2"
                                style={{ 
                                  backgroundColor: school.school_categories.color + '20',
                                  color: school.school_categories.color,
                                  borderColor: school.school_categories.color
                                }}
                              >
                                {school.school_categories.name_ar}
                              </Badge>
                            )}
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
