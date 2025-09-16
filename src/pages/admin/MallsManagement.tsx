import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl, handleImageError } from "@/utils/imageUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ImageUpload";
import MultiImageUpload from "@/components/MultiImageUpload";
import { 
  Plus, 
  Edit, 
  Trash2, 
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

interface MallData {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  googleMapsUrl: string;
  isOpen: boolean;
  closingTime: string;
  rating: number;
  image: string;
  images?: string[];
  logo: string;
  about: string;
  services: Array<{
    name: string;
    icon: string;
  }>;
  shops: Array<{
    name: string;
    category: string;
    floor: string;
    logo: string;
  }>;
  restaurants: Array<{
    name: string;
    cuisine: string;
    logo: string;
  }>;
  entertainment: {
    cinema: {
      name: string;
      currentMovies: Array<{
        title: string;
        genre: string;
        time: string;
        image: string;
      }>;
    };
    games: {
      name: string;
      description: string;
      image: string;
    };
    events: Array<{
      title: string;
      date: string;
      description: string;
      image: string;
    }>;
  };
}

const MallsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [malls, setMalls] = useState<MallData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMall, setEditingMall] = useState<MallData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Load malls from database
  useEffect(() => {
    loadMalls();
  }, []);

  const loadMalls = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      
      // Load malls
      const { data: mallsData, error: mallsError } = await supabase
        .from('malls')
        .select('*')
        .order('created_at', { ascending: false });

      if (mallsError) throw mallsError;

      if (mallsData) {
        const mallsWithDetails = await Promise.all(
          mallsData.map(async (mall) => {
            // Load services
            const { data: services } = await supabase
              .from('mall_services')
              .select('*')
              .eq('mall_id', mall.id);

            // Load shops
            const { data: shops } = await supabase
              .from('mall_shops')
              .select('*')
              .eq('mall_id', mall.id);

            // Load restaurants
            const { data: restaurants } = await supabase
              .from('mall_restaurants')
              .select('*')
              .eq('mall_id', mall.id);

            // Load cinema (with error handling)
            let cinema = null;
            let movies = [];
            try {
              const { data: cinemaData, error: cinemaError } = await supabase
                .from('mall_cinema')
                .select('*')
                .eq('mall_id', mall.id)
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
                .eq('mall_id', mall.id)
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
              .eq('mall_id', mall.id);

            return {
              id: mall.id,
              name: mall.name,
              description: mall.description || '',
              address: mall.address || '',
              phone: mall.phone || '',
              website: mall.website || '',
              googleMapsUrl: mall.google_maps_url || '',
              isOpen: mall.is_open,
              closingTime: mall.closing_time || '11:00 مساءً',
              rating: mall.rating || 0,
              image: mall.image_url || '/placeholder.svg',
              logo: mall.logo_url || '/placeholder.svg',
              about: mall.about || '',
              services: (services || []).map(s => ({ name: s.name, icon: s.icon })),
              shops: (shops || []).map(s => ({ 
                name: s.name, 
                category: s.category || '', 
                floor: s.floor || '', 
                logo: s.logo_url || '/placeholder.svg' 
              })),
              restaurants: (restaurants || []).map(r => ({ 
                name: r.name, 
                cuisine: r.cuisine || '', 
                logo: r.logo_url || '/placeholder.svg' 
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
                description: '',
                image: e.image_url || '/placeholder.svg'
              }))
              }
            };
          })
        );

        setMalls(mallsWithDetails);
      }
    } catch (error) {
      console.error('Error loading malls:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المولات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [newMall, setNewMall] = useState<Partial<MallData>>({
    name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    googleMapsUrl: "",
    isOpen: true,
    closingTime: "11:00 مساءً",
    rating: 0,
    image: "",
    images: [],
    logo: "",
    about: "",
    services: [],
    shops: [],
    restaurants: [],
    entertainment: {
      cinema: { name: "", currentMovies: [] },
      games: { name: "", description: "", image: "" },
      events: []
    }
  });

  const handleAddMall = async () => {
    if (!newMall.name || !newMall.description) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert mall
      const { data: mallData, error: mallError } = await supabase
        .from('malls')
        .insert({
          name: newMall.name,
          description: newMall.description,
          address: newMall.address || '',
          phone: newMall.phone || '',
          website: newMall.website || '',
          google_maps_url: newMall.googleMapsUrl || '',
          is_open: newMall.isOpen || false,
          closing_time: newMall.closingTime || '11:00 مساءً',
          rating: newMall.rating || 0,
          image_url: newMall.image || '/placeholder.svg',
          logo_url: newMall.logo || '/placeholder.svg',
          about: newMall.about || ''
        })
        .select()
        .single();

      if (mallError) throw mallError;

      const mallId = mallData.id;

      // Insert services
      if (newMall.services && newMall.services.length > 0) {
        const servicesData = newMall.services.map(service => ({
          mall_id: mallId,
          name: service.name,
          icon: service.icon
        }));
        await supabase.from('mall_services').insert(servicesData);
      }

      // Insert shops
      if (newMall.shops && newMall.shops.length > 0) {
        const shopsData = newMall.shops.map(shop => ({
          mall_id: mallId,
          name: shop.name,
          category: shop.category,
          floor: shop.floor,
          logo_url: shop.logo
        }));
        await supabase.from('mall_shops').insert(shopsData);
      }

      // Insert restaurants
      if (newMall.restaurants && newMall.restaurants.length > 0) {
        const restaurantsData = newMall.restaurants.map(restaurant => ({
          mall_id: mallId,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          logo_url: restaurant.logo
        }));
        await supabase.from('mall_restaurants').insert(restaurantsData);
      }

      // Insert cinema and movies
      if (newMall.entertainment?.cinema?.name) {
        const { data: cinemaData, error: cinemaError } = await supabase
          .from('mall_cinema')
          .insert({
            mall_id: mallId,
            name: newMall.entertainment.cinema.name
          })
          .select()
          .single();

        if (!cinemaError && cinemaData && newMall.entertainment.cinema.currentMovies.length > 0) {
          const moviesData = newMall.entertainment.cinema.currentMovies.map(movie => ({
            cinema_id: cinemaData.id,
            title: movie.title,
            genre: movie.genre,
            show_time: movie.time,
            image_url: movie.image
          }));
          await supabase.from('mall_movies').insert(moviesData);
        }
      }

      // Insert games
      if (newMall.entertainment?.games?.name) {
        await supabase.from('mall_games').insert({
          mall_id: mallId,
          name: newMall.entertainment.games.name,
          description: newMall.entertainment.games.description,
          image_url: newMall.entertainment.games.image
        });
      }

      // Insert events
      if (newMall.entertainment?.events && newMall.entertainment.events.length > 0) {
        const eventsData = newMall.entertainment.events.map(event => ({
          mall_id: mallId,
          title: event.title,
          event_date: event.date,
          image_url: event.image
        }));
        await supabase.from('mall_events').insert(eventsData);
      }

      toast({
        title: "نجح",
        description: "تم إضافة المول بنجاح",
      });

      // Reload malls to show updated images
      await loadMalls(true);

      // Reset form
      setNewMall({
        name: "",
        description: "",
        address: "",
        phone: "",
        website: "",
        googleMapsUrl: "",
        isOpen: true,
        closingTime: "11:00 مساءً",
        rating: 0,
        image: "",
        images: [],
        logo: "",
        about: "",
        services: [],
        shops: [],
        restaurants: [],
        entertainment: {
          cinema: { name: "", currentMovies: [] },
          games: { name: "", description: "", image: "" },
          events: []
        }
      });
      setIsAddDialogOpen(false);
      loadMalls(); // Reload malls
    } catch (error) {
      console.error('Error adding mall:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المول",
        variant: "destructive",
      });
    }
  };

  const handleEditMall = (mall: MallData) => {
    setEditingMall(mall);
    setNewMall(mall);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMall = async () => {
    if (!editingMall || !newMall.name) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update mall in database
      const { error: mallError } = await supabase
        .from('malls')
        .update({
          name: newMall.name,
          description: newMall.description,
          address: newMall.address || '',
          phone: newMall.phone || '',
          website: newMall.website || '',
          google_maps_url: newMall.googleMapsUrl || '',
          is_open: newMall.isOpen || false,
          closing_time: newMall.closingTime || '11:00 مساءً',
          rating: newMall.rating || 0,
          image_url: newMall.image || '/placeholder.svg',
          logo_url: newMall.logo || '/placeholder.svg',
          about: newMall.about || ''
        })
        .eq('id', editingMall.id);

      if (mallError) throw mallError;

      toast({
        title: "نجح",
        description: "تم تحديث المول بنجاح",
      });

      setIsEditDialogOpen(false);
      setEditingMall(null);
      
      // Reload malls to show updated data
      await loadMalls(true);
    } catch (error) {
      console.error('Error updating mall:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث المول",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMall = async (id: string) => {
    try {
      // Delete all related data first (due to foreign key constraints)
      await Promise.all([
        supabase.from('mall_services').delete().eq('mall_id', id),
        supabase.from('mall_shops').delete().eq('mall_id', id),
        supabase.from('mall_restaurants').delete().eq('mall_id', id),
        supabase.from('mall_events').delete().eq('mall_id', id),
        supabase.from('mall_games').delete().eq('mall_id', id)
      ]);

      // Delete cinema and movies
      const { data: cinema } = await supabase
        .from('mall_cinema')
        .select('id')
        .eq('mall_id', id)
        .single();

      if (cinema) {
        await supabase.from('mall_movies').delete().eq('cinema_id', cinema.id);
        await supabase.from('mall_cinema').delete().eq('id', cinema.id);
      }

      // Delete mall
      const { error } = await supabase
        .from('malls')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "نجح",
        description: "تم حذف المول بنجاح",
      });

      loadMalls(); // Reload malls
    } catch (error) {
      console.error('Error deleting mall:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المول",
        variant: "destructive",
      });
    }
  };

  const filteredMalls = malls.filter(mall =>
    mall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mall.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const iconMap: { [key: string]: any } = {
    Wifi, Car, Heart, CreditCard, MapPin, Clock, Phone, Globe,
    Search, Star, ExternalLink, Calendar, Film, Gamepad2, Music,
    ShoppingBag, Building2, Utensils, Camera
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة المولات</h1>
            <p className="text-muted-foreground">إضافة وتعديل وحذف المولات</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                إضافة مول جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة مول جديد</DialogTitle>
                <DialogDescription>
                  أضف مول جديد مع جميع التفاصيل والمحلات والخدمات
                </DialogDescription>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="services">الخدمات</TabsTrigger>
                  <TabsTrigger value="shops">المحلات</TabsTrigger>
                  <TabsTrigger value="restaurants">المطاعم</TabsTrigger>
                  <TabsTrigger value="entertainment">الترفيه</TabsTrigger>
                  <TabsTrigger value="analytics">إحصائيات المحلات</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">اسم المول *</Label>
                      <Input
                        id="name"
                        value={newMall.name || ""}
                        onChange={(e) => setNewMall({...newMall, name: e.target.value})}
                        placeholder="اسم المول"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">الوصف *</Label>
                      <Input
                        id="description"
                        value={newMall.description || ""}
                        onChange={(e) => setNewMall({...newMall, description: e.target.value})}
                        placeholder="وصف مختصر للمول"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        value={newMall.address || ""}
                        onChange={(e) => setNewMall({...newMall, address: e.target.value})}
                        placeholder="عنوان المول"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={newMall.phone || ""}
                        onChange={(e) => setNewMall({...newMall, phone: e.target.value})}
                        placeholder="رقم الهاتف"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">الموقع الإلكتروني</Label>
                      <Input
                        id="website"
                        value={newMall.website || ""}
                        onChange={(e) => setNewMall({...newMall, website: e.target.value})}
                        placeholder="الموقع الإلكتروني"
                      />
                    </div>
                    <div>
                      <Label htmlFor="googleMapsUrl">رابط Google Maps</Label>
                      <Input
                        id="googleMapsUrl"
                        value={newMall.googleMapsUrl || ""}
                        onChange={(e) => setNewMall({...newMall, googleMapsUrl: e.target.value})}
                        placeholder="https://maps.google.com/maps?q=..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">التقييم</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={newMall.rating || 0}
                        onChange={(e) => setNewMall({...newMall, rating: parseFloat(e.target.value)})}
                        placeholder="التقييم من 0 إلى 5"
                      />
                    </div>
                    <div>
                      <Label>صورة المول الرئيسية</Label>
                      <ImageUpload
                        value={newMall.image || ""}
                        onChange={(url) => setNewMall({...newMall, image: url})}
                        placeholder="رفع صورة المول الرئيسية"
                        aspectRatio="video"
                        className="mt-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>معرض صور المول</Label>
                      <MultiImageUpload
                        value={newMall.images || []}
                        onChange={(urls) => setNewMall({...newMall, images: urls})}
                        placeholder="رفع معرض صور المول"
                        maxImages={5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>شعار المول</Label>
                      <ImageUpload
                        value={newMall.logo || ""}
                        onChange={(url) => setNewMall({...newMall, logo: url})}
                        placeholder="رفع شعار المول"
                        aspectRatio="square"
                        className="mt-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="about">نبذة عن المول</Label>
                      <Textarea
                        id="about"
                        value={newMall.about || ""}
                        onChange={(e) => setNewMall({...newMall, about: e.target.value})}
                        placeholder="نبذة تفصيلية عن المول"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isOpen"
                        checked={newMall.isOpen || false}
                        onCheckedChange={(checked) => setNewMall({...newMall, isOpen: checked})}
                      />
                      <Label htmlFor="isOpen">المول مفتوح</Label>
                    </div>
                    <div>
                      <Label htmlFor="closingTime">ساعة الإغلاق</Label>
                      <Input
                        id="closingTime"
                        value={newMall.closingTime || ""}
                        onChange={(e) => setNewMall({...newMall, closingTime: e.target.value})}
                        placeholder="مثال: 11:00 مساءً"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                  <div className="text-center">
                    <Button 
                      onClick={() => {
                        const newService = { name: "", icon: "Wifi" };
                        setNewMall({
                          ...newMall,
                          services: [...(newMall.services || []), newService]
                        });
                      }}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة خدمة
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {(newMall.services || []).map((service, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>اسم الخدمة</Label>
                              <Input
                                value={service.name}
                                onChange={(e) => {
                                  const updatedServices = [...(newMall.services || [])];
                                  updatedServices[index].name = e.target.value;
                                  setNewMall({...newMall, services: updatedServices});
                                }}
                                placeholder="اسم الخدمة"
                              />
                            </div>
                            <div>
                              <Label>أيقونة الخدمة</Label>
                              <Select
                                value={service.icon}
                                onValueChange={(value) => {
                                  const updatedServices = [...(newMall.services || [])];
                                  updatedServices[index].icon = value;
                                  setNewMall({...newMall, services: updatedServices});
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Wifi">Wi-Fi</SelectItem>
                                  <SelectItem value="Car">مواقف سيارات</SelectItem>
                                  <SelectItem value="Heart">غرف صلاة</SelectItem>
                                  <SelectItem value="CreditCard">خدمات بنكية</SelectItem>
                                  <SelectItem value="MapPin">موقع</SelectItem>
                                  <SelectItem value="Clock">ساعات العمل</SelectItem>
                                  <SelectItem value="Phone">هاتف</SelectItem>
                                  <SelectItem value="Globe">موقع إلكتروني</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const updatedServices = (newMall.services || []).filter((_, i) => i !== index);
                                  setNewMall({...newMall, services: updatedServices});
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="shops" className="space-y-4">
                  <div className="text-center">
                    <Button 
                      onClick={() => {
                        const newShop = { name: "", category: "", floor: "", logo: "" };
                        setNewMall({
                          ...newMall,
                          shops: [...(newMall.shops || []), newShop]
                        });
                      }}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة محل
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {(newMall.shops || []).map((shop, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>اسم المحل</Label>
                              <Input
                                value={shop.name}
                                onChange={(e) => {
                                  const updatedShops = [...(newMall.shops || [])];
                                  updatedShops[index].name = e.target.value;
                                  setNewMall({...newMall, shops: updatedShops});
                                }}
                                placeholder="اسم المحل"
                              />
                            </div>
                            <div>
                              <Label>التصنيف</Label>
                              <Input
                                value={shop.category}
                                onChange={(e) => {
                                  const updatedShops = [...(newMall.shops || [])];
                                  updatedShops[index].category = e.target.value;
                                  setNewMall({...newMall, shops: updatedShops});
                                }}
                                placeholder="مثال: أزياء، إلكترونيات"
                              />
                            </div>
                            <div>
                              <Label>الطابق</Label>
                              <Input
                                value={shop.floor}
                                onChange={(e) => {
                                  const updatedShops = [...(newMall.shops || [])];
                                  updatedShops[index].floor = e.target.value;
                                  setNewMall({...newMall, shops: updatedShops});
                                }}
                                placeholder="مثال: الطابق الأول"
                              />
                            </div>
                            <div>
                              <Label>شعار المحل</Label>
                              <ImageUpload
                                value={shop.logo}
                                onChange={(url) => {
                                  const updatedShops = [...(newMall.shops || [])];
                                  updatedShops[index].logo = url;
                                  setNewMall({...newMall, shops: updatedShops});
                                }}
                                placeholder="رفع شعار المحل"
                                aspectRatio="square"
                                className="mt-2"
                              />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const updatedShops = (newMall.shops || []).filter((_, i) => i !== index);
                                  setNewMall({...newMall, shops: updatedShops});
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="restaurants" className="space-y-4">
                  <div className="text-center">
                    <Button 
                      onClick={() => {
                        const newRestaurant = { name: "", cuisine: "", logo: "" };
                        setNewMall({
                          ...newMall,
                          restaurants: [...(newMall.restaurants || []), newRestaurant]
                        });
                      }}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة مطعم
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {(newMall.restaurants || []).map((restaurant, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>اسم المطعم</Label>
                              <Input
                                value={restaurant.name}
                                onChange={(e) => {
                                  const updatedRestaurants = [...(newMall.restaurants || [])];
                                  updatedRestaurants[index].name = e.target.value;
                                  setNewMall({...newMall, restaurants: updatedRestaurants});
                                }}
                                placeholder="اسم المطعم"
                              />
                            </div>
                            <div>
                              <Label>نوع المطبخ</Label>
                              <Input
                                value={restaurant.cuisine}
                                onChange={(e) => {
                                  const updatedRestaurants = [...(newMall.restaurants || [])];
                                  updatedRestaurants[index].cuisine = e.target.value;
                                  setNewMall({...newMall, restaurants: updatedRestaurants});
                                }}
                                placeholder="مثال: إيطالي، شرقي، وجبات سريعة"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>شعار المطعم</Label>
                              <ImageUpload
                                value={restaurant.logo}
                                onChange={(url) => {
                                  const updatedRestaurants = [...(newMall.restaurants || [])];
                                  updatedRestaurants[index].logo = url;
                                  setNewMall({...newMall, restaurants: updatedRestaurants});
                                }}
                                placeholder="رفع شعار المطعم"
                                aspectRatio="square"
                                className="mt-2"
                              />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const updatedRestaurants = (newMall.restaurants || []).filter((_, i) => i !== index);
                                  setNewMall({...newMall, restaurants: updatedRestaurants});
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="entertainment" className="space-y-4">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>السينما</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>اسم السينما</Label>
                          <Input
                            value={newMall.entertainment?.cinema?.name || ""}
                            onChange={(e) => setNewMall({
                              ...newMall,
                              entertainment: {
                                ...newMall.entertainment!,
                                cinema: {
                                  ...newMall.entertainment!.cinema,
                                  name: e.target.value
                                }
                              }
                            })}
                            placeholder="اسم السينما"
                          />
                        </div>
                        <div className="text-center">
                          <Button 
                            onClick={() => {
                              const newMovie = { title: "", genre: "", time: "", image: "" };
                              setNewMall({
                                ...newMall,
                                entertainment: {
                                  ...newMall.entertainment!,
                                  cinema: {
                                    ...newMall.entertainment!.cinema,
                                    currentMovies: [...(newMall.entertainment?.cinema?.currentMovies || []), newMovie]
                                  }
                                }
                              });
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            إضافة فيلم
                          </Button>
                        </div>
                        <div className="space-y-4">
                          {(newMall.entertainment?.cinema?.currentMovies || []).map((movie, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>عنوان الفيلم</Label>
                                    <Input
                                      value={movie.title}
                                      onChange={(e) => {
                                        const updatedMovies = [...(newMall.entertainment?.cinema?.currentMovies || [])];
                                        updatedMovies[index].title = e.target.value;
                                        setNewMall({
                                          ...newMall,
                                          entertainment: {
                                            ...newMall.entertainment!,
                                            cinema: {
                                              ...newMall.entertainment!.cinema,
                                              currentMovies: updatedMovies
                                            }
                                          }
                                        });
                                      }}
                                      placeholder="عنوان الفيلم"
                                    />
                                  </div>
                                  <div>
                                    <Label>النوع</Label>
                                    <Input
                                      value={movie.genre}
                                      onChange={(e) => {
                                        const updatedMovies = [...(newMall.entertainment?.cinema?.currentMovies || [])];
                                        updatedMovies[index].genre = e.target.value;
                                        setNewMall({
                                          ...newMall,
                                          entertainment: {
                                            ...newMall.entertainment!,
                                            cinema: {
                                              ...newMall.entertainment!.cinema,
                                              currentMovies: updatedMovies
                                            }
                                          }
                                        });
                                      }}
                                      placeholder="مثال: أكشن، كوميديا"
                                    />
                                  </div>
                                  <div>
                                    <Label>موعد العرض</Label>
                                    <Input
                                      value={movie.time}
                                      onChange={(e) => {
                                        const updatedMovies = [...(newMall.entertainment?.cinema?.currentMovies || [])];
                                        updatedMovies[index].time = e.target.value;
                                        setNewMall({
                                          ...newMall,
                                          entertainment: {
                                            ...newMall.entertainment!,
                                            cinema: {
                                              ...newMall.entertainment!.cinema,
                                              currentMovies: updatedMovies
                                            }
                                          }
                                        });
                                      }}
                                      placeholder="مثال: 8:00 PM"
                                    />
                                  </div>
                                  <div>
                                    <Label>صورة الفيلم</Label>
                                    <ImageUpload
                                      value={movie.image}
                                      onChange={(url) => {
                                        const updatedMovies = [...(newMall.entertainment?.cinema?.currentMovies || [])];
                                        updatedMovies[index].image = url;
                                        setNewMall({
                                          ...newMall,
                                          entertainment: {
                                            ...newMall.entertainment!,
                                            cinema: {
                                              ...newMall.entertainment!.cinema,
                                              currentMovies: updatedMovies
                                            }
                                          }
                                        });
                                      }}
                                      placeholder="رفع صورة الفيلم"
                                      aspectRatio="video"
                                      className="mt-2"
                                    />
                                  </div>
                                  <div className="md:col-span-2 flex justify-end">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        const updatedMovies = (newMall.entertainment?.cinema?.currentMovies || []).filter((_, i) => i !== index);
                                        setNewMall({
                                          ...newMall,
                                          entertainment: {
                                            ...newMall.entertainment!,
                                            cinema: {
                                              ...newMall.entertainment!.cinema,
                                              currentMovies: updatedMovies
                                            }
                                          }
                                        });
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>منطقة الألعاب</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>اسم منطقة الألعاب</Label>
                          <Input
                            value={newMall.entertainment?.games?.name || ""}
                            onChange={(e) => setNewMall({
                              ...newMall,
                              entertainment: {
                                ...newMall.entertainment!,
                                games: {
                                  ...newMall.entertainment!.games,
                                  name: e.target.value
                                }
                              }
                            })}
                            placeholder="اسم منطقة الألعاب"
                          />
                        </div>
                        <div>
                          <Label>وصف منطقة الألعاب</Label>
                          <Textarea
                            value={newMall.entertainment?.games?.description || ""}
                            onChange={(e) => setNewMall({
                              ...newMall,
                              entertainment: {
                                ...newMall.entertainment!,
                                games: {
                                  ...newMall.entertainment!.games,
                                  description: e.target.value
                                }
                              }
                            })}
                            placeholder="وصف منطقة الألعاب"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>صورة منطقة الألعاب</Label>
                          <ImageUpload
                            value={newMall.entertainment?.games?.image || ""}
                            onChange={(url) => setNewMall({
                              ...newMall,
                              entertainment: {
                                ...newMall.entertainment!,
                                games: {
                                  ...newMall.entertainment!.games,
                                  image: url
                                }
                              }
                            })}
                            placeholder="رفع صورة منطقة الألعاب"
                            aspectRatio="video"
                            className="mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>الفعاليات</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <Button 
                            onClick={() => {
                              const newEvent = { title: "", date: "", description: "", image: "" };
                              setNewMall({
                                ...newMall,
                                entertainment: {
                                  ...newMall.entertainment!,
                                  events: [...(newMall.entertainment?.events || []), newEvent]
                                }
                              });
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            إضافة فعالية
                          </Button>
                        </div>
                        <div className="space-y-4">
                          {(newMall.entertainment?.events || []).map((event, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>عنوان الفعالية</Label>
                                    <Input
                                      value={event.title}
                                      onChange={(e) => {
                                        const updatedEvents = [...(newMall.entertainment?.events || [])];
                                        updatedEvents[index].title = e.target.value;
                                        setNewMall({
                                          ...newMall,
                                          entertainment: {
                                            ...newMall.entertainment!,
                                            events: updatedEvents
                                          }
                                        });
                                      }}
                                      placeholder="عنوان الفعالية"
                                    />
                                  </div>
                                  <div>
                                    <Label>تاريخ الفعالية</Label>
                                    <Input
                                      value={event.date}
                                      onChange={(e) => {
                                        const updatedEvents = [...(newMall.entertainment?.events || [])];
                                        updatedEvents[index].date = e.target.value;
                                        setNewMall({
                                          ...newMall,
                                          entertainment: {
                                            ...newMall.entertainment!,
                                            events: updatedEvents
                                          }
                                        });
                                      }}
                                      placeholder="مثال: 15 يناير"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <Label>صورة الفعالية</Label>
                                    <ImageUpload
                                      value={event.image}
                                      onChange={(url) => {
                                        const updatedEvents = [...(newMall.entertainment?.events || [])];
                                        updatedEvents[index].image = url;
                                        setNewMall({
                                          ...newMall,
                                          entertainment: {
                                            ...newMall.entertainment!,
                                            events: updatedEvents
                                          }
                                        });
                                      }}
                                      placeholder="رفع صورة الفعالية"
                                      aspectRatio="video"
                                      className="mt-2"
                                    />
                                  </div>
                                  <div className="md:col-span-2 flex justify-end">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        const updatedEvents = (newMall.entertainment?.events || []).filter((_, i) => i !== index);
                                        setNewMall({
                                          ...newMall,
                                          entertainment: {
                                            ...newMall.entertainment!,
                                            events: updatedEvents
                                          }
                                        });
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddMall}>
                  إضافة المول
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ابحث عن مول..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Malls List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMalls.map((mall) => (
            <Card key={mall.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={getImageUrl(mall.image)} 
                  alt={mall.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => handleImageError(e)}
                />
                <div className="absolute top-3 right-3">
                  <Badge variant={mall.isOpen ? "default" : "secondary"}>
                    {mall.isOpen ? "مفتوح" : "مغلق"}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold">{mall.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{mall.rating}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{mall.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{mall.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{mall.isOpen ? `مفتوح - يغلق ${mall.closingTime}` : 'مغلق'}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditMall(mall)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/mall/${mall.id}`)}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    عرض
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteMall(mall.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل المول</DialogTitle>
              <DialogDescription>
                عدّل تفاصيل المول والمحلات والخدمات
              </DialogDescription>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="services">الخدمات</TabsTrigger>
                <TabsTrigger value="shops">المحلات</TabsTrigger>
                <TabsTrigger value="restaurants">المطاعم</TabsTrigger>
                <TabsTrigger value="entertainment">الترفيه</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">اسم المول *</Label>
                    <Input
                      id="edit-name"
                      value={newMall.name || ""}
                      onChange={(e) => setNewMall({...newMall, name: e.target.value})}
                      placeholder="اسم المول"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">الوصف *</Label>
                    <Input
                      id="edit-description"
                      value={newMall.description || ""}
                      onChange={(e) => setNewMall({...newMall, description: e.target.value})}
                      placeholder="وصف مختصر للمول"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-address">العنوان</Label>
                    <Input
                      id="edit-address"
                      value={newMall.address || ""}
                      onChange={(e) => setNewMall({...newMall, address: e.target.value})}
                      placeholder="عنوان المول"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">رقم الهاتف</Label>
                    <Input
                      id="edit-phone"
                      value={newMall.phone || ""}
                      onChange={(e) => setNewMall({...newMall, phone: e.target.value})}
                      placeholder="رقم الهاتف"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-website">الموقع الإلكتروني</Label>
                    <Input
                      id="edit-website"
                      value={newMall.website || ""}
                      onChange={(e) => setNewMall({...newMall, website: e.target.value})}
                      placeholder="الموقع الإلكتروني"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-googleMapsUrl">رابط Google Maps</Label>
                    <Input
                      id="edit-googleMapsUrl"
                      value={newMall.googleMapsUrl || ""}
                      onChange={(e) => setNewMall({...newMall, googleMapsUrl: e.target.value})}
                      placeholder="https://maps.google.com/maps?q=..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-rating">التقييم</Label>
                    <Input
                      id="edit-rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={newMall.rating || 0}
                      onChange={(e) => setNewMall({...newMall, rating: parseFloat(e.target.value)})}
                      placeholder="التقييم من 0 إلى 5"
                    />
                  </div>
                  <div>
                    <Label>صورة المول</Label>
                    <ImageUpload
                      value={newMall.image || ""}
                      onChange={(url) => setNewMall({...newMall, image: url})}
                      placeholder="رفع صورة المول الرئيسية"
                      aspectRatio="video"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>شعار المول</Label>
                    <ImageUpload
                      value={newMall.logo || ""}
                      onChange={(url) => setNewMall({...newMall, logo: url})}
                      placeholder="رفع شعار المول"
                      aspectRatio="square"
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="edit-about">نبذة عن المول</Label>
                    <Textarea
                      id="edit-about"
                      value={newMall.about || ""}
                      onChange={(e) => setNewMall({...newMall, about: e.target.value})}
                      placeholder="نبذة تفصيلية عن المول"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-isOpen"
                      checked={newMall.isOpen || false}
                      onCheckedChange={(checked) => setNewMall({...newMall, isOpen: checked})}
                    />
                    <Label htmlFor="edit-isOpen">المول مفتوح</Label>
                  </div>
                  <div>
                    <Label htmlFor="edit-closingTime">ساعة الإغلاق</Label>
                    <Input
                      id="edit-closingTime"
                      value={newMall.closingTime || ""}
                      onChange={(e) => setNewMall({...newMall, closingTime: e.target.value})}
                      placeholder="مثال: 11:00 مساءً"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <div className="text-center">
                  <Button 
                    onClick={() => {
                      const newService = { name: "", icon: "Wifi" };
                      setNewMall({
                        ...newMall,
                        services: [...(newMall.services || []), newService]
                      });
                    }}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة خدمة
                  </Button>
                </div>
                <div className="space-y-4">
                  {(newMall.services || []).map((service, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>اسم الخدمة</Label>
                            <Input
                              value={service.name}
                              onChange={(e) => {
                                const updatedServices = [...(newMall.services || [])];
                                updatedServices[index].name = e.target.value;
                                setNewMall({...newMall, services: updatedServices});
                              }}
                              placeholder="اسم الخدمة"
                            />
                          </div>
                          <div>
                            <Label>أيقونة الخدمة</Label>
                            <Select
                              value={service.icon}
                              onValueChange={(value) => {
                                const updatedServices = [...(newMall.services || [])];
                                updatedServices[index].icon = value;
                                setNewMall({...newMall, services: updatedServices});
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الأيقونة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Wifi">Wi-Fi</SelectItem>
                                <SelectItem value="Car">مواقف سيارات</SelectItem>
                                <SelectItem value="Heart">غرف صلاة</SelectItem>
                                <SelectItem value="CreditCard">خدمات بنكية</SelectItem>
                                <SelectItem value="MapPin">معلومات الموقع</SelectItem>
                                <SelectItem value="Clock">مواعيد العمل</SelectItem>
                                <SelectItem value="Phone">خدمة العملاء</SelectItem>
                                <SelectItem value="Globe">الموقع الإلكتروني</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updatedServices = (newMall.services || []).filter((_, i) => i !== index);
                                setNewMall({...newMall, services: updatedServices});
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="shops" className="space-y-4">
                <div className="text-center">
                  <Button 
                    onClick={() => {
                      const newShop = { name: "", category: "", floor: "", logo: "" };
                      setNewMall({
                        ...newMall,
                        shops: [...(newMall.shops || []), newShop]
                      });
                    }}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة محل
                  </Button>
                </div>
                <div className="space-y-4">
                  {(newMall.shops || []).map((shop, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>اسم المحل</Label>
                            <Input
                              value={shop.name}
                              onChange={(e) => {
                                const updatedShops = [...(newMall.shops || [])];
                                updatedShops[index].name = e.target.value;
                                setNewMall({...newMall, shops: updatedShops});
                              }}
                              placeholder="اسم المحل"
                            />
                          </div>
                          <div>
                            <Label>التصنيف</Label>
                            <Input
                              value={shop.category}
                              onChange={(e) => {
                                const updatedShops = [...(newMall.shops || [])];
                                updatedShops[index].category = e.target.value;
                                setNewMall({...newMall, shops: updatedShops});
                              }}
                              placeholder="مثال: أزياء، إلكترونيات"
                            />
                          </div>
                          <div>
                            <Label>الطابق</Label>
                            <Input
                              value={shop.floor}
                              onChange={(e) => {
                                const updatedShops = [...(newMall.shops || [])];
                                updatedShops[index].floor = e.target.value;
                                setNewMall({...newMall, shops: updatedShops});
                              }}
                              placeholder="مثال: الطابق الأول"
                            />
                          </div>
                          <div>
                            <Label>شعار المحل</Label>
                            <ImageUpload
                              value={shop.logo}
                              onChange={(url) => {
                                const updatedShops = [...(newMall.shops || [])];
                                updatedShops[index].logo = url;
                                setNewMall({...newMall, shops: updatedShops});
                              }}
                              placeholder="رفع شعار المحل"
                              aspectRatio="square"
                              className="mt-2"
                            />
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updatedShops = (newMall.shops || []).filter((_, i) => i !== index);
                                setNewMall({...newMall, shops: updatedShops});
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="restaurants" className="space-y-4">
                <div className="text-center">
                  <Button 
                    onClick={() => {
                      const newRestaurant = { name: "", cuisine: "", logo: "" };
                      setNewMall({
                        ...newMall,
                        restaurants: [...(newMall.restaurants || []), newRestaurant]
                      });
                    }}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة مطعم
                  </Button>
                </div>
                <div className="space-y-4">
                  {(newMall.restaurants || []).map((restaurant, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>اسم المطعم</Label>
                            <Input
                              value={restaurant.name}
                              onChange={(e) => {
                                const updatedRestaurants = [...(newMall.restaurants || [])];
                                updatedRestaurants[index].name = e.target.value;
                                setNewMall({...newMall, restaurants: updatedRestaurants});
                              }}
                              placeholder="اسم المطعم"
                            />
                          </div>
                          <div>
                            <Label>نوع المطبخ</Label>
                            <Input
                              value={restaurant.cuisine}
                              onChange={(e) => {
                                const updatedRestaurants = [...(newMall.restaurants || [])];
                                updatedRestaurants[index].cuisine = e.target.value;
                                setNewMall({...newMall, restaurants: updatedRestaurants});
                              }}
                              placeholder="مثال: إيطالي، شرقي، وجبات سريعة"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>شعار المطعم</Label>
                            <ImageUpload
                              value={restaurant.logo}
                              onChange={(url) => {
                                const updatedRestaurants = [...(newMall.restaurants || [])];
                                updatedRestaurants[index].logo = url;
                                setNewMall({...newMall, restaurants: updatedRestaurants});
                              }}
                              placeholder="رفع شعار المطعم"
                              aspectRatio="square"
                              className="mt-2"
                            />
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updatedRestaurants = (newMall.restaurants || []).filter((_, i) => i !== index);
                                setNewMall({...newMall, restaurants: updatedRestaurants});
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="entertainment" className="space-y-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>السينما</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>اسم السينما</Label>
                        <Input
                          value={newMall.entertainment?.cinema?.name || ""}
                          onChange={(e) => setNewMall({
                            ...newMall,
                            entertainment: {
                              ...newMall.entertainment!,
                              cinema: {
                                ...newMall.entertainment!.cinema,
                                name: e.target.value
                              }
                            }
                          })}
                          placeholder="اسم السينما"
                        />
                      </div>
                      <div className="text-center">
                        <Button 
                          onClick={() => {
                            const newMovie = { title: "", genre: "", time: "", image: "" };
                            setNewMall({
                              ...newMall,
                              entertainment: {
                                ...newMall.entertainment!,
                                cinema: {
                                  ...newMall.entertainment!.cinema,
                                  currentMovies: [...(newMall.entertainment?.cinema?.currentMovies || []), newMovie]
                                }
                              }
                            });
                          }}
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          إضافة فيلم
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {(newMall.entertainment?.cinema?.currentMovies || []).map((movie, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>عنوان الفيلم</Label>
                                  <Input
                                    value={movie.title}
                                    onChange={(e) => {
                                      const updatedMovies = [...(newMall.entertainment?.cinema?.currentMovies || [])];
                                      updatedMovies[index].title = e.target.value;
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          cinema: {
                                            ...newMall.entertainment!.cinema,
                                            currentMovies: updatedMovies
                                          }
                                        }
                                      });
                                    }}
                                    placeholder="عنوان الفيلم"
                                  />
                                </div>
                                <div>
                                  <Label>نوع الفيلم</Label>
                                  <Input
                                    value={movie.genre}
                                    onChange={(e) => {
                                      const updatedMovies = [...(newMall.entertainment?.cinema?.currentMovies || [])];
                                      updatedMovies[index].genre = e.target.value;
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          cinema: {
                                            ...newMall.entertainment!.cinema,
                                            currentMovies: updatedMovies
                                          }
                                        }
                                      });
                                    }}
                                    placeholder="مثال: أكشن، كوميديا، دراما"
                                  />
                                </div>
                                <div>
                                  <Label>موعد العرض</Label>
                                  <Input
                                    value={movie.time}
                                    onChange={(e) => {
                                      const updatedMovies = [...(newMall.entertainment?.cinema?.currentMovies || [])];
                                      updatedMovies[index].time = e.target.value;
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          cinema: {
                                            ...newMall.entertainment!.cinema,
                                            currentMovies: updatedMovies
                                          }
                                        }
                                      });
                                    }}
                                    placeholder="مثال: 8:00 PM"
                                  />
                                </div>
                                <div>
                                  <Label>صورة الفيلم</Label>
                                  <ImageUpload
                                    value={movie.image}
                                    onChange={(url) => {
                                      const updatedMovies = [...(newMall.entertainment?.cinema?.currentMovies || [])];
                                      updatedMovies[index].image = url;
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          cinema: {
                                            ...newMall.entertainment!.cinema,
                                            currentMovies: updatedMovies
                                          }
                                        }
                                      });
                                    }}
                                    placeholder="رفع صورة الفيلم"
                                    aspectRatio="video"
                                    className="mt-2"
                                  />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const updatedMovies = (newMall.entertainment?.cinema?.currentMovies || []).filter((_, i) => i !== index);
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          cinema: {
                                            ...newMall.entertainment!.cinema,
                                            currentMovies: updatedMovies
                                          }
                                        }
                                      });
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>منطقة الألعاب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>اسم منطقة الألعاب</Label>
                        <Input
                          value={newMall.entertainment?.games?.name || ""}
                          onChange={(e) => setNewMall({
                            ...newMall,
                            entertainment: {
                              ...newMall.entertainment!,
                              games: {
                                ...newMall.entertainment!.games,
                                name: e.target.value
                              }
                            }
                          })}
                          placeholder="اسم منطقة الألعاب"
                        />
                      </div>
                      <div>
                        <Label>وصف منطقة الألعاب</Label>
                        <Textarea
                          value={newMall.entertainment?.games?.description || ""}
                          onChange={(e) => setNewMall({
                            ...newMall,
                            entertainment: {
                              ...newMall.entertainment!,
                              games: {
                                ...newMall.entertainment!.games,
                                description: e.target.value
                              }
                            }
                          })}
                          placeholder="وصف منطقة الألعاب"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>صورة منطقة الألعاب</Label>
                        <ImageUpload
                          value={newMall.entertainment?.games?.image || ""}
                          onChange={(url) => setNewMall({
                            ...newMall,
                            entertainment: {
                              ...newMall.entertainment!,
                              games: {
                                ...newMall.entertainment!.games,
                                image: url
                              }
                            }
                          })}
                          placeholder="رفع صورة منطقة الألعاب"
                          aspectRatio="video"
                          className="mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>الفعاليات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <Button 
                          onClick={() => {
                            const newEvent = { title: "", date: "", description: "", image: "" };
                            setNewMall({
                              ...newMall,
                              entertainment: {
                                ...newMall.entertainment!,
                                events: [...(newMall.entertainment?.events || []), newEvent]
                              }
                            });
                          }}
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          إضافة فعالية
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {(newMall.entertainment?.events || []).map((event, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>عنوان الفعالية</Label>
                                  <Input
                                    value={event.title}
                                    onChange={(e) => {
                                      const updatedEvents = [...(newMall.entertainment?.events || [])];
                                      updatedEvents[index].title = e.target.value;
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          events: updatedEvents
                                        }
                                      });
                                    }}
                                    placeholder="عنوان الفعالية"
                                  />
                                </div>
                                <div>
                                  <Label>تاريخ الفعالية</Label>
                                  <Input
                                    value={event.date}
                                    onChange={(e) => {
                                      const updatedEvents = [...(newMall.entertainment?.events || [])];
                                      updatedEvents[index].date = e.target.value;
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          events: updatedEvents
                                        }
                                      });
                                    }}
                                    placeholder="مثال: 15 يناير"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>وصف الفعالية</Label>
                                  <Textarea
                                    value={event.description}
                                    onChange={(e) => {
                                      const updatedEvents = [...(newMall.entertainment?.events || [])];
                                      updatedEvents[index].description = e.target.value;
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          events: updatedEvents
                                        }
                                      });
                                    }}
                                    placeholder="وصف الفعالية"
                                    rows={3}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>صورة الفعالية</Label>
                                  <ImageUpload
                                    value={event.image}
                                    onChange={(url) => {
                                      const updatedEvents = [...(newMall.entertainment?.events || [])];
                                      updatedEvents[index].image = url;
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          events: updatedEvents
                                        }
                                      });
                                    }}
                                    placeholder="رفع صورة الفعالية"
                                    aspectRatio="video"
                                    className="mt-2"
                                  />
                                </div>
                                <div className="md:col-span-2 flex justify-end">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const updatedEvents = (newMall.entertainment?.events || []).filter((_, i) => i !== index);
                                      setNewMall({
                                        ...newMall,
                                        entertainment: {
                                          ...newMall.entertainment!,
                                          events: updatedEvents
                                        }
                                      });
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleUpdateMall}>
                حفظ التغييرات
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MallsManagement;
