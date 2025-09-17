import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Phone, Clock, Save, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from '@/components/ui/image-upload';

interface Pharmacy {
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
  established_year?: number;
  operating_hours: string;
  services: string[];
  languages: string[];
  parking_available: boolean;
  wheelchair_accessible: boolean;
  home_delivery: boolean;
  emergency_service: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PharmaciesManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
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
    established_year: '',
    operating_hours: '',
    services: [] as string[],
    languages: [] as string[],
    parking_available: false,
    wheelchair_accessible: false,
    home_delivery: false,
    emergency_service: false,
    rating: 0,
    is_active: true
  });
  const [newService, setNewService] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const serviceOptions = [
    { value: 'prescription', label: 'وصفات طبية' },
    { value: 'otc', label: 'أدوية بدون وصفة' },
    { value: 'consultation', label: 'استشارة صيدلانية' },
    { value: 'delivery', label: 'توصيل منزلي' },
    { value: 'emergency', label: 'خدمة طوارئ' },
    { value: 'lab_tests', label: 'تحاليل طبية' },
    { value: 'medical_supplies', label: 'مستلزمات طبية' },
    { value: 'vaccination', label: 'تطعيمات' }
  ];

  const languageOptions = [
    'العربية', 'الإنجليزية', 'الفرنسية', 'الألمانية', 'الإيطالية', 'الإسبانية'
  ];

  useEffect(() => {
    if (user) {
      fetchPharmacies();
    }
  }, [user]);

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPharmacies(data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast.error('حدث خطأ أثناء تحميل الصيدليات');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const pharmacyData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        established_year: formData.established_year ? parseInt(formData.established_year) : null,
        rating: parseFloat(formData.rating.toString())
      };

      if (editingPharmacy) {
        const { error } = await supabase
          .from('pharmacies')
          .update(pharmacyData)
          .eq('id', editingPharmacy.id);

        if (error) throw error;
        toast.success('تم تحديث الصيدلية بنجاح');
      } else {
        const { error } = await supabase
          .from('pharmacies')
          .insert([pharmacyData]);

        if (error) throw error;
        toast.success('تم إضافة الصيدلية بنجاح');
      }

      setIsModalOpen(false);
      setEditingPharmacy(null);
      resetForm();
      fetchPharmacies();
    } catch (error) {
      console.error('Error saving pharmacy:', error);
      toast.error('حدث خطأ أثناء حفظ الصيدلية');
    }
  };

  const handleEdit = (pharmacy: Pharmacy) => {
    setEditingPharmacy(pharmacy);
    setFormData({
      name: pharmacy.name,
      description: pharmacy.description || '',
      phone: pharmacy.phone,
      address: pharmacy.address,
      email: pharmacy.email || '',
      latitude: pharmacy.latitude?.toString() || '',
      longitude: pharmacy.longitude?.toString() || '',
      google_maps_url: pharmacy.google_maps_url || '',
      image_url: pharmacy.image_url || '',
      logo_url: pharmacy.logo_url || '',
      established_year: pharmacy.established_year?.toString() || '',
      operating_hours: pharmacy.operating_hours,
      services: pharmacy.services || [],
      languages: pharmacy.languages || [],
      parking_available: pharmacy.parking_available,
      wheelchair_accessible: pharmacy.wheelchair_accessible,
      home_delivery: pharmacy.home_delivery,
      emergency_service: pharmacy.emergency_service,
      rating: pharmacy.rating,
      is_active: pharmacy.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الصيدلية؟')) {
      try {
        const { error } = await supabase
          .from('pharmacies')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('تم حذف الصيدلية بنجاح');
        fetchPharmacies();
      } catch (error) {
        console.error('Error deleting pharmacy:', error);
        toast.error('حدث خطأ أثناء حذف الصيدلية');
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
      established_year: '',
      operating_hours: '',
      services: [],
      languages: [],
      parking_available: false,
      wheelchair_accessible: false,
      home_delivery: false,
      emergency_service: false,
      rating: 0,
      is_active: true
    });
  };

  const getServiceLabel = (service: string) => {
    const serviceOption = serviceOptions.find(s => s.value === service);
    return serviceOption ? serviceOption.label : service;
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">إدارة الصيدليات</h1>
              <p className="text-muted-foreground">إدارة صيدليات المدينة</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة صيدلية جديدة
          </Button>
        </div>

        {/* Pharmacies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pharmacies.map((pharmacy) => (
            <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{pharmacy.name}</CardTitle>
                    <CardDescription>
                      {pharmacy.description || pharmacy.address}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{pharmacy.rating.toFixed(1)}</span>
                    </div>
                    <Badge variant={pharmacy.is_active ? "default" : "secondary"}>
                      {pharmacy.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{pharmacy.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{pharmacy.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{pharmacy.operating_hours}</span>
                  </div>
                </div>

                {pharmacy.services && pharmacy.services.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">الخدمات:</h4>
                    <div className="flex flex-wrap gap-1">
                      {pharmacy.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {getServiceLabel(service)}
                        </Badge>
                      ))}
                      {pharmacy.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pharmacy.services.length - 3} أخرى
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEdit(pharmacy)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(pharmacy.id)}
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
                    {editingPharmacy ? 'تعديل الصيدلية' : 'إضافة صيدلية جديدة'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingPharmacy(null);
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
                      <Label htmlFor="name">اسم الصيدلية</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="مثال: صيدلية النهضة"
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
                      placeholder="وصف الصيدلية..."
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
                        placeholder="pharmacy@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="operating_hours">ساعات العمل</Label>
                      <Input
                        id="operating_hours"
                        name="operating_hours"
                        value={formData.operating_hours}
                        onChange={handleInputChange}
                        placeholder="24/7"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="established_year">سنة التأسيس</Label>
                      <Input
                        id="established_year"
                        name="established_year"
                        type="number"
                        value={formData.established_year}
                        onChange={handleInputChange}
                        placeholder="2020"
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
                      label="صورة الصيدلية"
                      value={formData.image_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                      maxSize={5}
                    />
                    <ImageUpload
                      label="شعار الصيدلية"
                      value={formData.logo_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                      maxSize={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الخدمات المتاحة</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        placeholder="أضف خدمة جديدة"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                      />
                      <Button type="button" onClick={handleAddService}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.services.map((service, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {getServiceLabel(service)}
                          <button
                            type="button"
                            onClick={() => handleRemoveService(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>اللغات المتاحة</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="أضف لغة جديدة"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                      />
                      <Button type="button" onClick={handleAddLanguage}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {language}
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="parking_available"
                        checked={formData.parking_available}
                        onCheckedChange={(checked) => handleSwitchChange('parking_available', checked)}
                      />
                      <Label htmlFor="parking_available">موقف سيارات</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="wheelchair_accessible"
                        checked={formData.wheelchair_accessible}
                        onCheckedChange={(checked) => handleSwitchChange('wheelchair_accessible', checked)}
                      />
                      <Label htmlFor="wheelchair_accessible">إمكانية وصول</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="home_delivery"
                        checked={formData.home_delivery}
                        onCheckedChange={(checked) => handleSwitchChange('home_delivery', checked)}
                      />
                      <Label htmlFor="home_delivery">توصيل منزلي</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emergency_service"
                        checked={formData.emergency_service}
                        onCheckedChange={(checked) => handleSwitchChange('emergency_service', checked)}
                      />
                      <Label htmlFor="emergency_service">خدمة طوارئ</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">التقييم (0-5)</Label>
                      <Input
                        id="rating"
                        name="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={handleInputChange}
                        placeholder="4.5"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                      />
                      <Label htmlFor="is_active">نشط</Label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {editingPharmacy ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingPharmacy(null);
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

export default PharmaciesManagement;
