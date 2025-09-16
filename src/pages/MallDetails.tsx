import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl, handleImageError } from "@/utils/imageUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ShopRating from "@/components/ShopRating";
import { getShopRatingStats } from "@/utils/shopRatingsStorage";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Wifi, 
  Car, 
  Heart, 
  CreditCard,
  Search,
  Star,
  ExternalLink,
  Calendar,
  Film,
  Gamepad2,
  Music,
  ShoppingBag,
  Building2,
  Utensils,
  Camera
} from "lucide-react";

const MallDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [mallData, setMallData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<any>(null);

  const handleRatingUpdate = (shopId: string, averageRating: number, totalRatings: number) => {
    setMallData(prev => ({
      ...prev,
      shops: prev.shops.map(shop => 
        shop.id === shopId 
          ? { ...shop, average_rating: averageRating, total_ratings: totalRatings }
          : shop
      )
    }));
  };

  useEffect(() => {
    if (id) {
      loadMallData(id);
    }
  }, [id]);

  // Reload data when page becomes visible (for image updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        loadMallData(id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id]);

  const loadMallData = async (mallId: string) => {
    try {
      setLoading(true);
      
      // Load mall basic info
      const { data: mall, error: mallError } = await supabase
        .from('malls')
        .select('*')
        .eq('id', mallId)
        .single();

      if (mallError) throw mallError;

      // Load services
      const { data: services } = await supabase
        .from('mall_services')
        .select('*')
        .eq('mall_id', mallId);

      // Load shops
      const { data: shops } = await supabase
        .from('mall_shops')
        .select('*')
        .eq('mall_id', mallId);

      // Load restaurants
      const { data: restaurants } = await supabase
        .from('mall_restaurants')
        .select('*')
        .eq('mall_id', mallId);

      // Load cinema (with error handling)
      let cinema = null;
      let movies = [];
      try {
        const { data: cinemaData, error: cinemaError } = await supabase
          .from('mall_cinema')
          .select('*')
          .eq('mall_id', mallId)
          .single();
        
        if (cinemaError && cinemaError.code !== 'PGRST116') {
          console.log('Cinema query error:', cinemaError);
        } else {
          cinema = cinemaData;

          // Load movies if cinema exists
          if (cinema) {
            const { data: moviesData } = await supabase
              .from('mall_movies')
              .select('*')
              .eq('cinema_id', cinema.id);
            movies = moviesData || [];
          }
        }
      } catch (error) {
        console.log('Cinema data not available:', error);
        cinema = null;
        movies = [];
      }

      // Load games (with error handling)
      let games = null;
      try {
        const { data: gamesData, error: gamesError } = await supabase
          .from('mall_games')
          .select('*')
          .eq('mall_id', mallId)
          .single();
        
        if (gamesError && gamesError.code !== 'PGRST116') {
          console.log('Games query error:', gamesError);
        } else {
          games = gamesData;
        }
      } catch (error) {
        console.log('Games data not available:', error);
        games = null;
      }

      // Load events
      const { data: events } = await supabase
        .from('mall_events')
        .select('*')
        .eq('mall_id', mallId);

      const mallData = {
        id: mall.id,
        name: mall.name,
        logo: mall.logo_url || '/placeholder.svg',
        images: mall.image_url ? [mall.image_url] : ['/placeholder.svg'],
        address: mall.address || '',
        coordinates: { lat: 29.9682, lng: 30.9273 },
        openingHours: mall.is_open ? `مفتوح الآن - يغلق ${mall.closing_time}` : 'مغلق',
        phone: mall.phone || '',
        website: mall.website || '',
        socialMedia: {
          facebook: "facebook.com/octobergardensmall",
          instagram: "@octobergardensmall"
        },
        about: mall.about || '',
        googleMapsUrl: mall.google_maps_url || '',
        services: (services || []).map(s => ({
          name: s.name,
          icon: iconMap[s.icon] || Wifi
        })),
        shops: (shops || []).map(s => {
          const ratingStats = getShopRatingStats(s.id);
          return {
            id: s.id,
            name: s.name,
            category: s.category || '',
            floor: s.floor || '',
            logo: s.logo_url || '/placeholder.svg',
            phone: (s as any).phone || '',
            average_rating: ratingStats.averageRating,
            total_ratings: ratingStats.totalRatings
          };
        }),
        restaurants: (restaurants || []).map(r => ({
          name: r.name,
          cuisine: r.cuisine || '',
          logo: r.logo_url || '/placeholder.svg',
          phone: (r as any).phone || ''
        })),
        entertainment: {
          cinema: {
            name: cinema?.name || '',
            currentMovies: movies.map(m => ({
              title: m.title,
              genre: m.genre || '',
              time: m.show_time || '',
              image: m.image_url || '/placeholder.svg'
            }))
          },
          games: {
            name: games?.name || '',
            description: games?.description || '',
            image: games?.image_url || '/placeholder.svg'
          },
          events: (events || []).map(e => ({
            title: e.title,
            date: e.event_date || '',
            image: e.image_url || '/placeholder.svg'
          }))
        }
      };

      setMallData(mallData);
    } catch (error) {
      console.error('Error loading mall data:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconMap: { [key: string]: any } = {
    Wifi, Car, Heart, CreditCard, MapPin, Clock, Phone, Globe,
    Search, Star, ExternalLink, Calendar, Film, Gamepad2, Music,
    ShoppingBag, Building2, Utensils, Camera
  };

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

  if (!mallData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">المول غير موجود</h1>
          <Button onClick={() => navigate(-1)}>العودة</Button>
        </div>
      </div>
    );
  }


  const handleGoToMall = () => {
    console.log("Mall Data:", mallData);
    console.log("Google Maps URL:", mallData?.googleMapsUrl);
    
    // Open Google Maps with the mall's specific URL
    if (mallData?.googleMapsUrl) {
      console.log("Opening specific Google Maps URL:", mallData.googleMapsUrl);
      window.open(mallData.googleMapsUrl, "_blank");
    } else {
      console.log("No Google Maps URL found, opening general Google Maps");
      // Fallback to general Google Maps
      window.open("https://maps.google.com", "_blank");
    }
  };

  const filteredShops = mallData.shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.category.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <div className="w-full px-3 py-4 max-w-full">
        {/* Header Section */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← العودة
          </Button>
          
          {/* Image Carousel */}
          <Carousel className="w-full mb-4">
            <CarouselContent>
              {mallData.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative">
                    <img 
                      src={getImageUrl(image)} 
                      alt={`${mallData.name} - صورة ${index + 1}`}
                      className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg"
                      onError={(e) => handleImageError(e)}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          {/* Mall Info */}
          <div className="text-center mb-4 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-2 w-full">
              <img 
                src={getImageUrl(mallData.logo)} 
                alt={`شعار ${mallData.name}`}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                onError={(e) => handleImageError(e)}
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{mallData.name}</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 w-full">
              <Button onClick={handleGoToMall} className="w-full sm:w-auto text-sm max-w-xs sm:max-w-none">
                <MapPin className="w-4 h-4 mr-2" />
                اذهب للمول
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className={`text-sm font-semibold ${mallData.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {mallData.isOpen ? `مفتوح الآن - يغلق ${mallData.closingTime}` : 'مغلق'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full max-w-full">
          <TabsList className="flex w-full text-xs sm:text-sm overflow-x-auto max-w-full bg-muted/50">
            <TabsTrigger value="overview" className="flex-1 min-w-0 text-center px-2 py-2">نظرة عامة</TabsTrigger>
            <TabsTrigger value="shops" className="flex-1 min-w-0 text-center px-2 py-2">المحلات</TabsTrigger>
            <TabsTrigger value="restaurants" className="flex-1 min-w-0 text-center px-2 py-2">المطاعم</TabsTrigger>
            <TabsTrigger value="entertainment" className="flex-1 min-w-0 text-center px-2 py-2">الترفيه</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">عن المول</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">{mallData.about}</p>
                  
                  <h4 className="text-base sm:text-lg font-semibold mb-3">أهم الخدمات</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {mallData.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <service.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm">{service.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">معلومات الاتصال</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{mallData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <a href={`https://${mallData.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {mallData.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">فيسبوك:</span>
                      <a href={`https://${mallData.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {mallData.socialMedia.facebook}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">إنستجرام:</span>
                      <a href={`https://instagram.com/${mallData.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {mallData.socialMedia.instagram}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Shops Tab */}
          <TabsContent value="shops" className="mt-4 w-full">
            <div className="mb-4 w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ابحث عن محل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
              {filteredShops.map((shop, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getImageUrl(shop.logo)} 
                        alt={`شعار ${shop.name}`}
                        onError={(e) => handleImageError(e)}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{shop.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{shop.category}</Badge>
                          <span className="text-xs text-muted-foreground">{shop.floor}</span>
                        </div>
                        {shop.phone && (
                          <div className="flex items-center gap-1 mt-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{shop.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">
                            {shop.average_rating ? `${shop.average_rating.toFixed(1)} (${shop.total_ratings} تقييم)` : 'لا توجد تقييمات'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => setSelectedShop(shop)}
                    >
                      عرض التقييمات
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="mt-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
              {mallData.restaurants.map((restaurant, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getImageUrl(restaurant.logo)} 
                        alt={`شعار ${restaurant.name}`}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => handleImageError(e)}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{restaurant.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{restaurant.cuisine}</Badge>
                        </div>
                        {restaurant.phone && (
                          <div className="flex items-center gap-1 mt-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{restaurant.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Entertainment Tab */}
          <TabsContent value="entertainment" className="mt-4 w-full">
            <div className="space-y-4 sm:space-y-6 w-full">
              {/* Cinema Section */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Film className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <h3 className="text-lg sm:text-xl font-semibold">{mallData.entertainment.cinema.name}</h3>
                  </div>
                  <h4 className="text-base sm:text-lg font-medium mb-3">الأفلام المعروضة حالياً</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mallData.entertainment.cinema.currentMovies.map((movie, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                        <img 
                          src={movie.image} 
                          alt={movie.title}
                          className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div>
                          <h5 className="text-sm sm:text-base font-medium">{movie.title}</h5>
                          <p className="text-xs sm:text-sm text-muted-foreground">{movie.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Games Section */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <h3 className="text-lg sm:text-xl font-semibold">{mallData.entertainment.games.name}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3">{mallData.entertainment.games.description}</p>
                  <img 
                    src={mallData.entertainment.games.image} 
                    alt={mallData.entertainment.games.name}
                    className="w-full h-32 sm:h-48 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>

              {/* Events Section */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <h3 className="text-lg sm:text-xl font-semibold">الفعاليات والعروض</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mallData.entertainment.events.map((event, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                        <img 
                          src={getImageUrl(event.image)} 
                          alt={event.title}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                          onError={(e) => handleImageError(e)}
                        />
                        <div>
                          <h5 className="text-sm sm:text-base font-medium">{event.title}</h5>
                          <p className="text-xs sm:text-sm text-muted-foreground">{event.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Shop Ratings Modal */}
        {selectedShop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">تقييمات {selectedShop.name}</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedShop(null)}
                  >
                    إغلاق
                  </Button>
                </div>
                <ShopRating 
                  shopId={selectedShop.id} 
                  shopName={selectedShop.name}
                  currentRating={selectedShop.average_rating}
                  totalRatings={selectedShop.total_ratings}
                  onRatingUpdate={handleRatingUpdate}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MallDetails;
