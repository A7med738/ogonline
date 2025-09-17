import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hotel, Phone, MapPin, Clock, Star, Wifi, Car, Coffee, Utensils, Dumbbell, WashingMachine, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Hotel {
  id: string;
  name: string;
  description?: string;
  phone: string;
  address: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  image_url?: string;
  logo_url?: string;
  star_rating: number;
  price_range: string;
  check_in_time: string;
  check_out_time: string;
  amenities: string[];
  room_types: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CityServicesHotels = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('is_active', true)
        .order('star_rating', { ascending: false });

      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('حدث خطأ أثناء تحميل الفنادق');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleLocation = (hotel: Hotel) => {
    if (hotel.google_maps_url) {
      window.open(hotel.google_maps_url, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(hotel.address)}`, '_blank');
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return Wifi;
      case 'parking': return Car;
      case 'restaurant': return Utensils;
      case 'gym': return Dumbbell;
      case 'laundry': return WashingMachine;
      case 'coffee': return Coffee;
      default: return Star;
    }
  };

  const getAmenityLabel = (amenity: string) => {
    const amenityLabels: { [key: string]: string } = {
      'wifi': 'واي فاي مجاني',
      'parking': 'موقف سيارات',
      'restaurant': 'مطعم',
      'gym': 'صالة رياضية',
      'laundry': 'خدمة الغسيل',
      'coffee': 'مقهى',
      'pool': 'مسبح',
      'spa': 'سبا',
      'conference': 'قاعات مؤتمرات',
      'room_service': 'خدمة الغرف',
      'airport_shuttle': 'نقل المطار',
      'pet_friendly': 'صديق للحيوانات الأليفة'
    };
    return amenityLabels[amenity] || amenity;
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || hotel.star_rating >= parseInt(filterRating);
    const matchesPrice = filterPrice === 'all' || hotel.price_range === filterPrice;
    
    return matchesSearch && matchesRating && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/city-services')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">فنادق المدينة</h1>
            <p className="text-muted-foreground">فنادق ومنتجعات في المدينة</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Input
              placeholder="البحث في الفنادق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger>
              <SelectValue placeholder="التقييم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التقييمات</SelectItem>
              <SelectItem value="5">5 نجوم</SelectItem>
              <SelectItem value="4">4 نجوم فأكثر</SelectItem>
              <SelectItem value="3">3 نجوم فأكثر</SelectItem>
              <SelectItem value="2">2 نجوم فأكثر</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPrice} onValueChange={setFilterPrice}>
            <SelectTrigger>
              <SelectValue placeholder="نطاق السعر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأسعار</SelectItem>
              <SelectItem value="budget">اقتصادي</SelectItem>
              <SelectItem value="mid-range">متوسط</SelectItem>
              <SelectItem value="luxury">فاخر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-8">
                  <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد فنادق متاحة حالياً</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredHotels.map((hotel) => (
              <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {hotel.logo_url ? (
                        <img
                          src={hotel.logo_url}
                          alt={hotel.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="p-2 rounded-lg bg-blue-500 text-white">
                          <Hotel className="h-6 w-6" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">{hotel.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {hotel.description || hotel.address}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < hotel.star_rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hotel Image */}
                  {hotel.image_url && (
                    <div className="w-full h-32 rounded-lg overflow-hidden">
                      <img
                        src={hotel.image_url}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{hotel.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{hotel.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        تسجيل الدخول: {hotel.check_in_time} | المغادرة: {hotel.check_out_time}
                      </span>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {hotel.price_range === 'budget' ? 'اقتصادي' : 
                       hotel.price_range === 'mid-range' ? 'متوسط' : 
                       hotel.price_range === 'luxury' ? 'فاخر' : hotel.price_range}
                    </Badge>
                  </div>

                  {/* Room Types */}
                  {hotel.room_types && hotel.room_types.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">أنواع الغرف:</h4>
                      <div className="flex flex-wrap gap-1">
                        {hotel.room_types.slice(0, 3).map((roomType, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {roomType}
                          </Badge>
                        ))}
                        {hotel.room_types.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{hotel.room_types.length - 3} أخرى
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">المرافق:</h4>
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.slice(0, 4).map((amenity, index) => {
                          const IconComponent = getAmenityIcon(amenity);
                          return (
                            <div key={index} className="flex items-center gap-1 text-xs text-blue-600">
                              <IconComponent className="h-3 w-3" />
                              <span>{getAmenityLabel(amenity)}</span>
                            </div>
                          );
                        })}
                        {hotel.amenities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{hotel.amenities.length - 4} أخرى
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleContact(hotel.phone)}
                      size="sm"
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      اتصل
                    </Button>
                    <Button
                      onClick={() => handleLocation(hotel)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      الموقع
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CityServicesHotels;
