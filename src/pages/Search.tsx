import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Clock, X, Filter, Star, MapPin, Phone, Mail, Globe, Calendar, User, Building2, GraduationCap, Heart, ShoppingBag, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  image_url?: string;
  created_at?: string;
  published_at?: string;
}

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // تحميل البحثات الحديثة من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // البحث في جميع الجداول
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchTerm = `%${query}%`;
      
      // البحث في الأخبار
      const { data: newsData } = await supabase
        .from('news')
        .select('id, title, summary as description, category, published_at as created_at, image_url')
        .or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .order('published_at', { ascending: false })
        .limit(10);

      // البحث في أقسام الشرطة
      const { data: policeData } = await supabase
        .from('police_stations')
        .select('id, name as title, description, area as category, address, phone, rating')
        .or(`name.ilike.${searchTerm},area.ilike.${searchTerm},address.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10);

      // البحث في إدارات المدينة
      const { data: departmentsData } = await supabase
        .from('city_departments')
        .select('id, title, description, phone, email, hours as category')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(10);

      // البحث في المدارس
      const { data: schoolsData } = await supabase
        .from('schools')
        .select('id, name as title, description, type as category, address, phone, rating, image_url')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
        .eq('is_active', true)
        .limit(10);

      // البحث في الجامعات
      const { data: universitiesData } = await supabase
        .from('universities')
        .select('id, name as title, description, type as category, address, phone, rating, image_url')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
        .eq('is_active', true)
        .limit(10);

      // البحث في المستشفيات
      const { data: hospitalsData } = await supabase
        .from('hospitals')
        .select('id, name as title, description, type as category, address, phone, rating, image_url')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
        .eq('is_active', true)
        .limit(10);

      // البحث في المولات
      const { data: mallsData } = await supabase
        .from('malls')
        .select('id, name as title, description, address, phone, rating, image_url')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
        .eq('is_active', true)
        .limit(10);

      // دمج النتائج
      const allResults: SearchResult[] = [
        ...(newsData || []).map(item => ({ ...item, type: 'news' })),
        ...(policeData || []).map(item => ({ ...item, type: 'police' })),
        ...(departmentsData || []).map(item => ({ ...item, type: 'department' })),
        ...(schoolsData || []).map(item => ({ ...item, type: 'school' })),
        ...(universitiesData || []).map(item => ({ ...item, type: 'university' })),
        ...(hospitalsData || []).map(item => ({ ...item, type: 'hospital' })),
        ...(mallsData || []).map(item => ({ ...item, type: 'mall' }))
      ];

      setSearchResults(allResults);
      
      // حفظ البحث في البحثات الحديثة
      if (query.trim() && !recentSearches.includes(query.trim())) {
        const newRecentSearches = [query.trim(), ...recentSearches.slice(0, 4)];
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // البحث عند تغيير النص
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // البحث عند تحميل الصفحة مع query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [location.search]);

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      news: Globe,
      police: Shield,
      department: Building,
      school: GraduationCap,
      university: Building2,
      hospital: Heart,
      mall: ShoppingBag,
      property: Home
    };
    return icons[type] || Search;
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      news: 'أخبار',
      police: 'شرطة',
      department: 'إدارة',
      school: 'مدرسة',
      university: 'جامعة',
      hospital: 'مستشفى',
      mall: 'مول',
      property: 'عقار'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      news: 'text-blue-600',
      police: 'text-blue-800',
      department: 'text-blue-500',
      school: 'text-indigo-600',
      university: 'text-purple-600',
      hospital: 'text-red-600',
      mall: 'text-yellow-600',
      property: 'text-green-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const handleResultClick = (result: SearchResult) => {
    // حفظ البحث في البحثات الحديثة
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      const newRecentSearches = [searchQuery.trim(), ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }

    // التنقل حسب نوع النتيجة
    switch (result.type) {
      case 'news':
        navigate('/news');
        break;
      case 'police':
        navigate('/police');
        break;
      case 'department':
        navigate('/city');
        break;
      case 'school':
        navigate('/educational-services/schools');
        break;
      case 'university':
        navigate('/educational-services/universities');
        break;
      case 'hospital':
        navigate('/medical-services/hospitals');
        break;
      case 'mall':
        navigate('/city-malls');
        break;
      default:
        navigate('/');
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const filteredResults = activeTab === 'all' 
    ? searchResults 
    : searchResults.filter(result => result.type === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">البحث</h1>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="ابحث عن أي شيء..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 text-right"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        {searchQuery ? (
          <div>
            {/* Filter Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="news">أخبار</TabsTrigger>
                <TabsTrigger value="police">شرطة</TabsTrigger>
                <TabsTrigger value="department">إدارات</TabsTrigger>
                <TabsTrigger value="school">مدارس</TabsTrigger>
                <TabsTrigger value="university">جامعات</TabsTrigger>
                <TabsTrigger value="hospital">مستشفيات</TabsTrigger>
                <TabsTrigger value="mall">مولات</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Results */}
            {isSearching ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">جارٍ البحث...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((result) => {
                  const IconComponent = getTypeIcon(result.type);
                  return (
                    <Card 
                      key={`${result.type}-${result.id}`} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${getTypeColor(result.type)}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 truncate">{result.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {getTypeLabel(result.type)}
                              </Badge>
                            </div>
                            {result.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {result.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {result.address && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{result.address}</span>
                                </div>
                              )}
                              {result.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{result.phone}</span>
                                </div>
                              )}
                              {result.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{result.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-600">جرب البحث بكلمات مختلفة</p>
              </div>
            )}
          </div>
        ) : (
          /* Recent Searches */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">البحثات الحديثة</h2>
              {recentSearches.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearRecentSearches}
                  className="text-gray-500"
                >
                  <X className="h-4 w-4 mr-1" />
                  مسح الكل
                </Button>
              )}
            </div>
            
            {recentSearches.length > 0 ? (
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-right"
                    onClick={() => setSearchQuery(search)}
                  >
                    <Clock className="h-4 w-4 ml-2 text-gray-400" />
                    {search}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ابدأ البحث</h3>
                <p className="text-gray-600">ابحث عن الأخبار، الخدمات، والأماكن في مدينتك</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
