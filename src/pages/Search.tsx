import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Clock, X, Filter, Star, MapPin, Phone, Mail, Globe, Calendar, User, Building2, GraduationCap, Heart, ShoppingBag, Home, Shield, Banknote, CreditCard, Users, FileText, Briefcase, AlertTriangle, Building, Car, BookOpen, Stethoscope, Utensils, Camera, Music, Gamepad2, Calendar as CalendarIcon, Package, Truck, Mail as MailIcon, Wifi, Car as CarIcon, CreditCard as CreditCardIcon, Heart as HeartIcon, CreditCard as CreditCardIcon2, Search as SearchIcon, Star as StarIcon, ExternalLink, Calendar as CalendarIcon2, Film, Gamepad2 as Gamepad2Icon, Music as MusicIcon, ShoppingBag as ShoppingBagIcon, Building2 as Building2Icon, Utensils as UtensilsIcon, Camera as CameraIcon } from 'lucide-react';
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
      
      // البحث في جميع الجداول المتاحة
      const searchPromises = [
        // الأخبار
        supabase
          .from('news')
          .select('id, title, summary as description, category, published_at as created_at, image_url')
          .or(`title.ilike.${searchTerm},summary.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .order('published_at', { ascending: false })
          .limit(5),

        // أقسام الشرطة
        supabase
          .from('police_stations')
          .select('id, name as title, description, area as category, address, phone, rating')
          .or(`name.ilike.${searchTerm},area.ilike.${searchTerm},address.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(5),

        // إدارات المدينة
        supabase
          .from('city_departments')
          .select('id, title, description, phone, email, hours as category')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(5),

        // المدارس
        supabase
          .from('schools')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // الجامعات
        supabase
          .from('universities')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // المستشفيات
        supabase
          .from('hospitals')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // العيادات
        supabase
          .from('clinics')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // المولات
        supabase
          .from('malls')
          .select('id, name as title, description, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // العقارات
        supabase
          .from('properties')
          .select('id, title, description, property_type as category, address, price, area, image_url')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // البنوك
        supabase
          .from('banks')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // أجهزة الصراف الآلي
        supabase
          .from('atms')
          .select('id, name as title, bank_name as category, address, phone, services')
          .or(`name.ilike.${searchTerm},bank_name.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // الأحداث
        supabase
          .from('events')
          .select('id, title, description, event_type as category, venue as address, organizer, start_date as created_at, image_url')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},venue.ilike.${searchTerm},organizer.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // الوظائف
        supabase
          .from('jobs')
          .select('id, title, description, company as category, location as address, salary, created_at, image_url')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},company.ilike.${searchTerm},location.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // الإعلانات
        supabase
          .from('announcements')
          .select('id, title, description, category, created_at, image_url')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // المكاتب البريدية
        supabase
          .from('post_offices')
          .select('id, name as title, description, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // الأندية الشبابية
        supabase
          .from('youth_clubs')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // دور الحضانة
        supabase
          .from('nurseries')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // المراكز التعليمية
        supabase
          .from('educational_centers')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // وحدات الصحة
        supabase
          .from('health_units')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // المراكز الطبية
        supabase
          .from('medical_centers')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // الأماكن المقدسة
        supabase
          .from('worship_places')
          .select('id, name as title, description, type as category, address, phone, rating, image_url')
          .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},address.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5),

        // المفقودات
        supabase
          .from('lost_and_found_items')
          .select('id, title, description, category, location as address, contact_phone as phone, created_at, image_url')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
          .eq('is_active', true)
          .limit(5)
      ];

      // تنفيذ جميع عمليات البحث
      const results = await Promise.allSettled(searchPromises);
      
      // استخراج البيانات الناجحة
      const allResults: SearchResult[] = [];
      
      const tableTypes = [
        'news', 'police', 'department', 'school', 'university', 'hospital', 
        'clinic', 'mall', 'property', 'bank', 'atm', 'event', 'job', 
        'announcement', 'post_office', 'youth_club', 'nursery', 'educational_center',
        'health_unit', 'medical_center', 'worship_place', 'lost_item'
      ];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
          const type = tableTypes[index] || 'unknown';
          const items = result.value.data.map(item => ({ ...item, type }));
          allResults.push(...items);
        }
      });

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
      clinic: Stethoscope,
      mall: ShoppingBag,
      property: Home,
      bank: Banknote,
      atm: CreditCard,
      event: Calendar,
      job: Briefcase,
      announcement: FileText,
      post_office: Mail,
      youth_club: Users,
      nursery: BookOpen,
      educational_center: GraduationCap,
      health_unit: Heart,
      medical_center: Stethoscope,
      worship_place: Building,
      lost_item: AlertTriangle
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
      clinic: 'عيادة',
      mall: 'مول',
      property: 'عقار',
      bank: 'بنك',
      atm: 'صراف آلي',
      event: 'حدث',
      job: 'وظيفة',
      announcement: 'إعلان',
      post_office: 'مكتب بريد',
      youth_club: 'نادي شباب',
      nursery: 'حضانة',
      educational_center: 'مركز تعليمي',
      health_unit: 'وحدة صحية',
      medical_center: 'مركز طبي',
      worship_place: 'مكان عبادة',
      lost_item: 'مفقودات'
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
      clinic: 'text-red-500',
      mall: 'text-yellow-600',
      property: 'text-green-600',
      bank: 'text-green-700',
      atm: 'text-green-500',
      event: 'text-purple-500',
      job: 'text-orange-600',
      announcement: 'text-gray-600',
      post_office: 'text-blue-700',
      youth_club: 'text-pink-600',
      nursery: 'text-pink-500',
      educational_center: 'text-indigo-500',
      health_unit: 'text-red-400',
      medical_center: 'text-red-500',
      worship_place: 'text-yellow-700',
      lost_item: 'text-orange-500'
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
      case 'clinic':
      case 'health_unit':
      case 'medical_center':
        navigate('/medical-services/hospitals');
        break;
      case 'mall':
        navigate('/city-malls');
        break;
      case 'property':
        navigate('/real-estate');
        break;
      case 'bank':
      case 'atm':
        navigate('/city-services/atms');
        break;
      case 'event':
        navigate('/city-services/events');
        break;
      case 'job':
        navigate('/jobs');
        break;
      case 'announcement':
        navigate('/announcements');
        break;
      case 'post_office':
        navigate('/city-services/post-offices');
        break;
      case 'youth_club':
        navigate('/city-services/youth-clubs');
        break;
      case 'nursery':
      case 'educational_center':
        navigate('/educational-services/schools');
        break;
      case 'worship_place':
        navigate('/worship-places');
        break;
      case 'lost_item':
        navigate('/lost-and-found');
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
    : searchResults.filter(result => {
      switch (activeTab) {
        case 'school':
          return ['school', 'university', 'nursery', 'educational_center'].includes(result.type);
        case 'hospital':
          return ['hospital', 'clinic', 'health_unit', 'medical_center'].includes(result.type);
        case 'bank':
          return ['bank', 'atm'].includes(result.type);
        default:
          return result.type === activeTab;
      }
    });

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
              <TabsList className="grid w-full grid-cols-6 gap-1 overflow-x-auto">
                <TabsTrigger value="all" className="text-xs">الكل</TabsTrigger>
                <TabsTrigger value="news" className="text-xs">أخبار</TabsTrigger>
                <TabsTrigger value="police" className="text-xs">شرطة</TabsTrigger>
                <TabsTrigger value="department" className="text-xs">إدارات</TabsTrigger>
                <TabsTrigger value="school" className="text-xs">تعليم</TabsTrigger>
                <TabsTrigger value="hospital" className="text-xs">صحة</TabsTrigger>
                <TabsTrigger value="mall" className="text-xs">مولات</TabsTrigger>
                <TabsTrigger value="property" className="text-xs">عقارات</TabsTrigger>
                <TabsTrigger value="bank" className="text-xs">بنوك</TabsTrigger>
                <TabsTrigger value="event" className="text-xs">أحداث</TabsTrigger>
                <TabsTrigger value="job" className="text-xs">وظائف</TabsTrigger>
                <TabsTrigger value="announcement" className="text-xs">إعلانات</TabsTrigger>
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
                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                              {result.address && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-32">{result.address}</span>
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
                              {result.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-24">{result.email}</span>
                                </div>
                              )}
                              {result.website && (
                                <div className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  <span className="truncate max-w-24">{result.website}</span>
                                </div>
                              )}
                              {result.price && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-green-600">{result.price} جنيه</span>
                                </div>
                              )}
                              {result.area && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-600">{result.area} م²</span>
                                </div>
                              )}
                              {result.salary && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-orange-600">{result.salary}</span>
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
