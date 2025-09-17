import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, MapPin, Clock, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/image-upload';

interface GasCompany {
  id: string;
  name: string;
  description?: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  operating_hours?: string;
  services?: string[];
  booking_url?: string;
  image_url?: string;
  logo_url?: string;
  is_active: boolean;
}

const GasCompanyManagement = () => {
  const [branches, setBranches] = useState<GasCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBranch, setEditingBranch] = useState<GasCompany | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    google_maps_url: '',
    operating_hours: '',
    services: [] as string[],
    booking_url: '',
    image_url: '',
    logo_url: '',
    is_active: true
  });
  const [newService, setNewService] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('gas_company')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching gas company branches:', error);
      toast.error('حدث خطأ أثناء تحميل فروع شركة الغاز');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const branchData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        services: formData.services.filter(service => service.trim() !== '')
      };

      if (editingBranch) {
        const { error } = await supabase
          .from('gas_company')
          .update(branchData)
          .eq('id', editingBranch.id);

        if (error) throw error;
        toast.success('تم تحديث فرع شركة الغاز بنجاح');
      } else {
        const { error } = await supabase
          .from('gas_company')
          .insert([branchData]);

        if (error) throw error;
        toast.success('تم إضافة فرع شركة الغاز بنجاح');
      }

      setShowForm(false);
      setEditingBranch(null);
      resetForm();
      fetchBranches();
    } catch (error) {
      console.error('Error saving gas company branch:', error);
      toast.error('حدث خطأ أثناء حفظ فرع شركة الغاز');
    }
  };

  const handleEdit = (branch: GasCompany) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      description: branch.description || '',
      phone: branch.phone,
      address: branch.address,
      latitude: branch.latitude?.toString() || '',
      longitude: branch.longitude?.toString() || '',
      google_maps_url: branch.google_maps_url || '',
      operating_hours: branch.operating_hours || '',
      services: branch.services || [],
      booking_url: branch.booking_url || '',
      image_url: branch.image_url || '',
      logo_url: branch.logo_url || '',
      is_active: branch.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف فرع شركة الغاز؟')) return;

    try {
      const { error } = await supabase
        .from('gas_company')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف فرع شركة الغاز بنجاح');
      fetchBranches();
    } catch (error) {
      console.error('Error deleting gas company branch:', error);
      toast.error('حدث خطأ أثناء حذف فرع شركة الغاز');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      phone: '',
      address: '',
      latitude: '',
      longitude: '',
      google_maps_url: '',
      operating_hours: '',
      services: [],
      booking_url: '',
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
        <h2 className="text-2xl font-bold">إدارة فروع شركة الغاز</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          إضافة فرع جديد
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBranch ? 'تعديل فرع شركة الغاز' : 'إضافة فرع جديد لشركة الغاز'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم الفرع *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                  <Label htmlFor="booking_url">رابط حجز الموعد</Label>
                  <Input
                    id="booking_url"
                    value={formData.booking_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, booking_url: e.target.value }))}
                    placeholder="https://example.com/booking"
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
                    placeholder="مثال: السبت - الخميس: 8:00 - 16:00"
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
                  <Label>صورة الفرع</Label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                    maxSize={5}
                  />
                </div>
                <div>
                  <Label>شعار الفرع</Label>
                  <ImageUpload
                    value={formData.logo_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                    maxSize={2}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingBranch ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingBranch(null);
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
        {branches.map((branch) => (
          <Card key={branch.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{branch.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{branch.address}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(branch)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(branch.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {branch.description && (
                <p className="text-sm mb-2">{branch.description}</p>
              )}
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {branch.phone}
                </div>
                {branch.operating_hours && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {branch.operating_hours}
                  </div>
                )}
                {branch.booking_url && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <a href={branch.booking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      رابط حجز الموعد
                    </a>
                  </div>
                )}
              </div>
              {branch.services && branch.services.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {branch.services.map((service, index) => (
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

export default GasCompanyManagement;
