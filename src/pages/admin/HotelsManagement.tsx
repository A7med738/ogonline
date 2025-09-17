import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Phone, Clock, Save, X, Star, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from '@/components/ui/image-upload';

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

const HotelsManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    email: '',
    latitude: '',
    longitude: '',
    google_maps_url: '',
    image_url: '',
    logo_url: '',
    star_rating: 3,
    price_range: 'mid-range',
    check_in_time: '14:00',
    check_out_time: '12:00',
    amenities: [] as string[],
    room_types: [] as string[],
    is_active: true
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newRoomType, setNewRoomType] = useState('');

  const amenityOptions = [
    { value: 'wifi', label: 'واي فاي مجاني' },
    { value: 'parking', label: 'موقف سيارات' },
    { value: 'restaurant', label: 'مطعم' },
    { value: 'gym', label: 'صالة رياضية' },
    { value: 'pool', label: 'مسبح' },
    { value: 'spa', label: 'سبا' },
    { value: 'laundry', label: 'خدمة الغسيل' },
    { value: 'coffee', label: 'مقهى' },
    { value: 'conference', label: 'قاعات مؤتمرات' },
    { value: 'room_service', label: 'خدمة الغرف' },
    { value: 'airport_shuttle', label: 'نقل المطار' },
    { value: 'pet_friendly', label: 'صديق للحيوانات الأليفة' }
  ];

  const roomTypeOptions = [
    'غرفة فردية', 'غرفة مزدوجة', 'جناح', 'شقة', 'فيلا', 'شاليه', 'غرفة عائلية', 'غرفة تنفيذية'
  ];

  useEffect(() => {
    if (user) {
      fetchHotels();
    }
  }, [user]);

  const fetchHotels = async () => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('حدث خطأ أثناء تحميل الفنادق');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleAddRoomType = () => {
    if (newRoomType.trim() && !formData.room_types.includes(newRoomType.trim())) {
      setFormData(prev => ({
        ...prev,
        room_types: [...prev.room_types, newRoomType.trim()]
      }));
      setNewRoomType('');
    }
  };

  const handleRemoveRoomType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      room_types: prev.room_types.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const hotelData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        star_rating: parseInt(formData.star_rating.toString())
      };

      if (editingHotel) {
        const { error } = await supabase
          .from('hotels')
          .update(hotelData)
          .eq('id', editingHotel.id);

        if (error) throw error;
        toast.success('تم تحديث الفندق بنجاح');
      } else {
        const { error } = await supabase
          .from('hotels')
          .insert([hotelData]);

        if (error) throw error;
        toast.success('تم إضافة الفندق بنجاح');
      }

      setIsModalOpen(false);
      setEditingHotel(null);
      resetForm();
      fetchHotels();
    } catch (error) {
      console.error('Error saving hotel:', error);
      toast.error('حدث خطأ أثناء حفظ الفندق');
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      description: hotel.description || '',
      phone: hotel.phone,
      address: hotel.address,
      email: hotel.email || '',
      latitude: hotel.latitude?.toString() || '',
      longitude: hotel.longitude?.toString() || '',
      google_maps_url: hotel.google_maps_url || '',
      image_url: hotel.image_url || '',
      logo_url: hotel.logo_url || '',
      star_rating: hotel.star_rating,
      price_range: hotel.price_range,
      check_in_time: hotel.check_in_time,
      check_out_time: hotel.check_out_time,
      amenities: hotel.amenities || [],
      room_types: hotel.room_types || [],
      is_active: hotel.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفندق؟')) {
      try {
        const { error } = await supabase
          .from('hotels')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('تم حذف الفندق بنجاح');
        fetchHotels();
      } catch (error) {
        console.error('Error deleting hotel:', error);
        toast.error('حدث خطأ أثناء حذف الفندق');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      phone: '',
      address: '',
      email: '',
      latitude: '',
      longitude: '',
      google_maps_url: '',
      image_url: '',
      logo_url: '',
      star_rating: 3,
      price_range: 'mid-range',
      check_in_time: '14:00',
      check_out_time: '12:00',
      amenities: [],
      room_types: [],
      is_active: true
    });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">إدارة الفنادق</h1>
              <p className="text-muted-foreground">إدارة فنادق المدينة</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة فندق جديد
          </Button>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
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
                      <CardDescription>
                        {hotel.description || hotel.address}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Badge variant={hotel.is_active ? "default" : "secondary"}>
                      {hotel.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      {hotel.check_in_time} - {hotel.check_out_time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {hotel.price_range === 'budget' ? 'اقتصادي' : 
                     hotel.price_range === 'mid-range' ? 'متوسط' : 
                     hotel.price_range === 'luxury' ? 'فاخر' : hotel.price_range}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEdit(hotel)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(hotel.id)}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {editingHotel ? 'تعديل الفندق' : 'إضافة فندق جديد'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingHotel(null);
                      resetForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">اسم الفندق</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="مثال: فندق النهضة"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم التليفون</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="01234567890"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="وصف الفندق..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="شارع النهضة، حدائق أكتوبر"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="hotel@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="star_rating">التقييم بالنجوم</Label>
                      <Select
                        value={formData.star_rating.toString()}
                        onValueChange={(value) => handleSelectChange('star_rating', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التقييم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 نجمة</SelectItem>
                          <SelectItem value="2">2 نجمتين</SelectItem>
                          <SelectItem value="3">3 نجوم</SelectItem>
                          <SelectItem value="4">4 نجوم</SelectItem>
                          <SelectItem value="5">5 نجوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_range">نطاق السعر</Label>
                      <Select
                        value={formData.price_range}
                        onValueChange={(value) => handleSelectChange('price_range', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نطاق السعر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="budget">اقتصادي</SelectItem>
                          <SelectItem value="mid-range">متوسط</SelectItem>
                          <SelectItem value="luxury">فاخر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="check_in_time">وقت تسجيل الدخول</Label>
                      <Input
                        id="check_in_time"
                        name="check_in_time"
                        type="time"
                        value={formData.check_in_time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="check_out_time">وقت المغادرة</Label>
                      <Input
                        id="check_out_time"
                        name="check_out_time"
                        type="time"
                        value={formData.check_out_time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">خط العرض</Label>
                      <Input
                        id="latitude"
                        name="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="30.123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">خط الطول</Label>
                      <Input
                        id="longitude"
                        name="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="31.123456"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google_maps_url">رابط خرائط جوجل</Label>
                    <Input
                      id="google_maps_url"
                      name="google_maps_url"
                      value={formData.google_maps_url}
                      onChange={handleInputChange}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUpload
                      label="صورة الفندق"
                      value={formData.image_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                      maxSize={5}
                    />
                    <ImageUpload
                      label="شعار الفندق"
                      value={formData.logo_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                      maxSize={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المرافق</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="أضف مرفق جديد"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                      />
                      <Button type="button" onClick={handleAddAmenity}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {amenity}
                          <button
                            type="button"
                            onClick={() => handleRemoveAmenity(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>أنواع الغرف</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newRoomType}
                        onChange={(e) => setNewRoomType(e.target.value)}
                        placeholder="أضف نوع غرفة جديد"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRoomType())}
                      />
                      <Button type="button" onClick={handleAddRoomType}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.room_types.map((roomType, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {roomType}
                          <button
                            type="button"
                            onClick={() => handleRemoveRoomType(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active">نشط</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {editingHotel ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingHotel(null);
                        resetForm();
                      }}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelsManagement;
