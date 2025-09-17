import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload';

interface GasStation {
  id: string;
  name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  operating_hours?: string;
  services?: string[];
  image_url?: string;
  logo_url?: string;
  is_active: boolean;
}

const GasStationsManagement = () => {
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStation, setEditingStation] = useState<GasStation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    google_maps_url: '',
    operating_hours: '',
    services: [] as string[],
    image_url: '',
    logo_url: '',
    is_active: true
  });
  const [newService, setNewService] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('gas_stations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching gas stations:', error);
      toast.error('حدث خطأ أثناء تحميل محطات الوقود');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const stationData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        services: formData.services.filter(service => service.trim() !== '')
      };

      if (editingStation) {
        const { error } = await supabase
          .from('gas_stations')
          .update(stationData)
          .eq('id', editingStation.id);

        if (error) throw error;
        toast.success('تم تحديث محطة الوقود بنجاح');
      } else {
        const { error } = await supabase
          .from('gas_stations')
          .insert([stationData]);

        if (error) throw error;
        toast.success('تم إضافة محطة الوقود بنجاح');
      }

      setShowForm(false);
      setEditingStation(null);
      resetForm();
      fetchStations();
    } catch (error) {
      console.error('Error saving gas station:', error);
      toast.error('حدث خطأ أثناء حفظ محطة الوقود');
    }
  };

  const handleEdit = (station: GasStation) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      description: station.description || '',
      address: station.address,
      latitude: station.latitude?.toString() || '',
      longitude: station.longitude?.toString() || '',
      google_maps_url: station.google_maps_url || '',
      operating_hours: station.operating_hours || '',
      services: station.services || [],
      image_url: station.image_url || '',
      logo_url: station.logo_url || '',
      is_active: station.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف محطة الوقود؟')) return;

    try {
      const { error } = await supabase
        .from('gas_stations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف محطة الوقود بنجاح');
      fetchStations();
    } catch (error) {
      console.error('Error deleting gas station:', error);
      toast.error('حدث خطأ أثناء حذف محطة الوقود');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      google_maps_url: '',
      operating_hours: '',
      services: [],
      image_url: '',
      logo_url: '',
      is_active: true
    });
    setNewService('');
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة محطات الوقود</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          إضافة محطة وقود
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingStation ? 'تعديل محطة الوقود' : 'إضافة محطة وقود جديدة'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم محطة الوقود *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">العنوان *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="latitude">خط العرض</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">خط الطول</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="operating_hours">ساعات العمل</Label>
                  <Input
                    id="operating_hours"
                    value={formData.operating_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, operating_hours: e.target.value }))}
                    placeholder="مثال: 24/7 أو السبت - الخميس: 8:00 - 16:00"
                  />
                </div>
                <div>
                  <Label htmlFor="google_maps_url">رابط خرائط جوجل</Label>
                  <Input
                    id="google_maps_url"
                    value={formData.google_maps_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label>الخدمات المتاحة</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="أضف خدمة جديدة"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  />
                  <Button type="button" onClick={addService}>
                    إضافة
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeService(service)}>
                      {service} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>صورة المحطة</Label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                    maxSize={5}
                  />
                </div>
                <div>
                  <Label>شعار المحطة</Label>
                  <ImageUpload
                    value={formData.logo_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                    maxSize={2}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingStation ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingStation(null);
                  resetForm();
                }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station) => (
          <Card key={station.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{station.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{station.address}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(station)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(station.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {station.description && (
                <p className="text-sm mb-2">{station.description}</p>
              )}
              {station.operating_hours && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  {station.operating_hours}
                </div>
              )}
              {station.services && station.services.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {station.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GasStationsManagement;
