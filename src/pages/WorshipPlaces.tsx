import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Users, 
  Clock, 
  Heart, 
  Search,
  Filter,
  Calendar,
  BookOpen,
  GraduationCap,
  Utensils,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WorshipPlace {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  image_url: string;
  logo_url: string;
  prayer_times: any;
  services: any;
  capacity: number;
  is_accessible: boolean;
  events: Array<{
    id: string;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    image_url: string;
  }>;
  worship_services: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
}

const WorshipPlaces = () => {
  const [worshipPlaces, setWorshipPlaces] = useState<WorshipPlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<WorshipPlace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  const worshipTypes = [
    { value: 'all', label: 'جميع الأنواع' },
    { value: 'مسجد', label: 'مساجد' },
    { value: 'كنيسة', label: 'كنائس' },
    { value: 'معبد', label: 'معابد' }
  ];

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      BookOpen,
      GraduationCap,
      Utensils,
      Heart,
      Users,
      Clock,
      MapPin,
      Phone
    };
    return icons[iconName] || BookOpen;
  };

  useEffect(() => {
    loadWorshipPlaces();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [worshipPlaces, searchTerm, selectedType]);

  const loadWorshipPlaces = async () => {
    try {
      setLoading(true);
      const { data: worshipPlacesData, error: worshipError } = await supabase
        .from('worship_places')
        .select('*')
        .order('created_at', { ascending: false });

      if (worshipError) throw worshipError;

      // Load events and services for each worship place
      const worshipPlacesWithDetails = await Promise.all(
        worshipPlacesData.map(async (worshipPlace) => {
          const { data: events } = await supabase
            .from('worship_place_events')
            .select('*')
            .eq('worship_place_id', worshipPlace.id);

          const { data: services } = await supabase
            .from('worship_place_services')
            .select('*')
            .eq('worship_place_id', worshipPlace.id);

          return {
            ...worshipPlace,
            events: events || [],
            worship_services: services || []
          };
        })
      );

      setWorshipPlaces(worshipPlacesWithDetails);
    } catch (error) {
      console.error('Error loading worship places:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlaces = () => {
    let filtered = worshipPlaces;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(place => place.type === selectedType);
    }

    setFilteredPlaces(filtered);
  };

  const formatPrayerTimes = (prayerTimes: any) => {
    if (!prayerTimes) return null;
    return Object.entries(prayerTimes).map(([prayer, time]) => (
      <div key={prayer} className="flex justify-between text-sm">
        <span>{prayer}</span>
        <span className="font-medium">{time as string}</span>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل دور العبادة...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            دور العبادة
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اكتشف دور العبادة في مدينتك واعرف أوقات الصلاة والفعاليات
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="ابحث عن دار عبادة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                {worshipTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Worship Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <Card key={place.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={place.image_url?.startsWith('data:') ? place.image_url : (place.image_url || '/placeholder.svg')}
                  alt={place.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-white/90 text-gray-800">
                    {place.type}
                  </Badge>
                </div>
                {place.is_accessible && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Heart className="w-3 h-3 mr-1" />
                      متاح للجميع
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={place.logo_url?.startsWith('data:') ? place.logo_url : (place.logo_url || '/placeholder.svg')}
                    alt="Logo"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg text-right">{place.name}</CardTitle>
                    {place.description && (
                      <p className="text-sm text-gray-600 text-right mt-1 line-clamp-2">
                        {place.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  {place.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-right flex-1">{place.address}</span>
                    </div>
                  )}
                  {place.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-right">{place.phone}</span>
                    </div>
                  )}
                  {place.capacity > 0 && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-right">السعة: {place.capacity}</span>
                    </div>
                  )}
                </div>

                {/* Prayer Times */}
                {place.prayer_times && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      أوقات الصلاة
                    </h4>
                    <div className="space-y-1">
                      {formatPrayerTimes(place.prayer_times)}
                    </div>
                  </div>
                )}

                {/* Services */}
                {place.worship_services && place.worship_services.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">الخدمات المتاحة</h4>
                    <div className="flex flex-wrap gap-2">
                      {place.worship_services.slice(0, 3).map((service) => {
                        const IconComponent = getIconComponent(service.icon);
                        return (
                          <Badge key={service.id} variant="outline" className="text-xs">
                            <IconComponent className="w-3 h-3 mr-1" />
                            {service.name}
                          </Badge>
                        );
                      })}
                      {place.worship_services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{place.worship_services.length - 3} أخرى
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Events */}
                {place.events && place.events.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      الفعاليات القادمة
                    </h4>
                    <div className="space-y-2">
                      {place.events.slice(0, 2).map((event) => (
                        <div key={event.id} className="text-sm bg-blue-50 p-2 rounded">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-gray-600">{event.event_date} - {event.event_time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  {place.website && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={place.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-1" />
                        الموقع
                      </a>
                    </Button>
                  )}
                  {place.phone && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`tel:${place.phone}`}>
                        <Phone className="w-4 h-4 mr-1" />
                        اتصل
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlaces.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد دور عبادة
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all' 
                ? 'لم نجد دور عبادة تطابق البحث' 
                : 'لا توجد دور عبادة مضافة بعد'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorshipPlaces;
