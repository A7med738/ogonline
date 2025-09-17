import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, MapPin, Phone, Clock, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from '@/components/ui/image-upload';

interface CityService {
  id: string;
  service_type: string;
  name: string;
  description?: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  image_url?: string;
  logo_url?: string;
  operating_hours: string;
  services: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CityServicesNewManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState<CityService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CityService | null>(null);
  const [formData, setFormData] = useState({
    service_type: '',
    name: '',
    description: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    google_maps_url: '',
    image_url: '',
    logo_url: '',
    operating_hours: '',
    services: [] as string[],
    is_active: true
  });
  const [newService, setNewService] = useState('');

  const serviceTypes = [
    { value: 'traffic', label: 'مرور' },
    { value: 'civil_registry', label: 'سجل مدني' },
    { value: 'wholesale_market', label: 'سوق الجمله' },
    { value: 'city_center', label: 'سنترال المدينه' },
    { value: 'family_court', label: 'نيابة الاسره' },
    { value: 'courts', label: 'مجمع المحاكم' },
    { value: 'education_department', label: 'الاداره التعليميه' }
  ];

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('city_services_new')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('حدث خطأ أثناء تحميل الخدمات');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const serviceData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      if (editingService) {
        const { error } = await supabase
          .from('city_services_new')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success('تم تحديث الخدمة بنجاح');
      } else {
        const { error } = await supabase
          .from('city_services_new')
          .insert([serviceData]);

        if (error) throw error;
        toast.success('تم إضافة الخدمة بنجاح');
      }

      setIsModalOpen(false);
      setEditingService(null);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('حدث خطأ أثناء حفظ الخدمة');
    }
  };

  const handleEdit = (service: CityService) => {
    setEditingService(service);
    setFormData({
      service_type: service.service_type,
      name: service.name,
      description: service.description || '',
      phone: service.phone,
      address: service.address,
      latitude: service.latitude?.toString() || '',
      longitude: service.longitude?.toString() || '',
      google_maps_url: service.google_maps_url || '',
      image_url: service.image_url || '',
      logo_url: service.logo_url || '',
      operating_hours: service.operating_hours,
      services: service.services || [],
      is_active: service.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      try {
        const { error } = await supabase
          .from('city_services_new')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('تم حذف الخدمة بنجاح');
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('حدث خطأ أثناء حذف الخدمة');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      service_type: '',
      name: '',
      description: '',
      phone: '',
      address: '',
      latitude: '',
      longitude: '',
      google_maps_url: '',
      image_url: '',
      logo_url: '',
      operating_hours: '',
      services: [],
      is_active: true
    });
  };

  const getServiceTypeLabel = (type: string) => {
    const service = serviceTypes.find(s => s.value === type);
    return service ? service.label : type;
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
              <h1 className="text-2xl font-bold text-foreground">إدارة الخدمات الجديدة</h1>
              <p className="text-muted-foreground">إدارة خدمات المدينة الجديدة</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة خدمة جديدة
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>
                      {getServiceTypeLabel(service.service_type)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{service.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{service.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{service.operating_hours}</span>
                  </div>
                </div>

                {service.services && service.services.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">الخدمات:</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.services.slice(0, 3).map((serviceItem, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {serviceItem}
                        </Badge>
                      ))}
                      {service.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{service.services.length - 3} أخرى
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEdit(service)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(service.id)}
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
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingService(null);
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
                      <Label htmlFor="service_type">نوع الخدمة</Label>
                      <Select
                        value={formData.service_type}
                        onValueChange={(value) => handleSelectChange('service_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الخدمة" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">اسم الخدمة</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="مثال: إدارة المرور الرئيسية"
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
                      placeholder="وصف الخدمة..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="operating_hours">ساعات العمل</Label>
                      <Input
                        id="operating_hours"
                        name="operating_hours"
                        value={formData.operating_hours}
                        onChange={handleInputChange}
                        placeholder="السبت - الخميس: 8:00 - 16:00"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="شارع المرور، حدائق أكتوبر"
                      required
                    />
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
                      label="صورة الخدمة"
                      value={formData.image_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                      maxSize={5}
                    />
                    <ImageUpload
                      label="شعار الخدمة"
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
                          {service}
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">نشط</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {editingService ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingService(null);
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

export default CityServicesNewManagement;
