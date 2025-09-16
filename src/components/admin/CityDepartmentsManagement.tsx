import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, MapPin, Building } from "lucide-react";

interface CityDepartment {
  id: string;
  title: string;
  description: string;
  phone: string;
  email: string;
  hours: string;
  icon: string;
  color: string;
  latitude: number;
  longitude: number;
  show_location: boolean;
  order_priority: number;
  google_maps_url: string;
}

export const CityDepartmentsManagement = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<CityDepartment[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    phone: '',
    email: '',
    hours: '',
    icon: 'Building',
    color: 'from-blue-500 to-blue-600',
    latitude: '',
    longitude: '',
    show_location: true,
    order_priority: 0,
    google_maps_url: ''
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('city_departments')
        .select('*')
        .order('order_priority');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل أجهزة المدينة",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const departmentData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        order_priority: parseInt(formData.order_priority.toString())
      };

      if (editingId) {
        const { error } = await supabase
          .from('city_departments')
          .update(departmentData)
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('city_departments')
          .insert(departmentData);

        if (error) throw error;
        setIsAdding(false);
      }

      setFormData({
        title: '',
        description: '',
        phone: '',
        email: '',
        hours: '',
        icon: 'Building',
        color: 'from-blue-500 to-blue-600',
        latitude: '',
        longitude: '',
        show_location: true,
        order_priority: 0,
        google_maps_url: ''
      });
      loadDepartments();
      
      toast({
        title: "تم بنجاح",
        description: editingId ? "تم تحديث الجهاز" : "تم إضافة الجهاز",
      });
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الجهاز",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (dept: CityDepartment) => {
    setFormData({
      title: dept.title,
      description: dept.description || '',
      phone: dept.phone,
      email: dept.email,
      hours: dept.hours,
      icon: dept.icon,
      color: dept.color,
      latitude: dept.latitude?.toString() || '',
      longitude: dept.longitude?.toString() || '',
      show_location: dept.show_location,
      order_priority: dept.order_priority,
      google_maps_url: dept.google_maps_url || ''
    });
    setEditingId(dept.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('city_departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      loadDepartments();
      toast({
        title: "تم بنجاح",
        description: "تم حذف الجهاز",
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الجهاز",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      phone: '',
      email: '',
      hours: '',
      icon: 'Building',
      color: 'from-blue-500 to-blue-600',
      latitude: '',
      longitude: '',
      show_location: true,
      order_priority: 0,
      google_maps_url: ''
    });
  };

  const icons = ['Building', 'Hospital', 'School', 'Car', 'Zap', 'Droplets', 'Shield', 'Users', 'Phone'];
  const colors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-red-500 to-red-600',
    'from-purple-500 to-purple-600',
    'from-yellow-500 to-yellow-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-orange-500 to-orange-600'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">إدارة أجهزة المدينة</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة جهاز جديد
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم الجهاز</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="اسم الجهاز أو الدائرة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="رقم الهاتف"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="البريد الإلكتروني"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ساعات العمل</label>
              <Input
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="الأحد - الخميس: 8:00 - 16:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الأيقونة</label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {icons.map((icon) => (
                    <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">اللون</label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className={`w-4 h-4 rounded bg-gradient-to-r ${color} inline-block ml-2`}></div>
                      {color.split(' ')[0].replace('from-', '').replace('-500', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">خط العرض</label>
              <Input
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="24.7136"
                type="number"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">خط الطول</label>
              <Input
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="46.6753"
                type="number"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ترتيب الأولوية</label>
              <Input
                value={formData.order_priority}
                onChange={(e) => setFormData({ ...formData, order_priority: parseInt(e.target.value) || 0 })}
                placeholder="0"
                type="number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">الوصف</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الجهاز وخدماته"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">رابط خرائط جوجل</label>
              <Input
                value={formData.google_maps_url}
                onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                placeholder="https://maps.google.com/..."
                type="url"
              />
              <p className="text-xs text-muted-foreground mt-1">
                انسخ رابط خرائط جوجل من المتصفح ولصقه هنا
              </p>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Switch
                checked={formData.show_location}
                onCheckedChange={(checked) => setFormData({ ...formData, show_location: checked })}
              />
              <label className="text-sm">إظهار الموقع على الخريطة</label>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {editingId ? 'تحديث' : 'حفظ'}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                إلغاء
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${dept.color} flex items-center justify-center text-white`}>
                  <Building className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{dept.title}</h4>
                  {dept.description && (
                    <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>
                  )}
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <div>هاتف: {dept.phone}</div>
                    <div>بريد إلكتروني: {dept.email}</div>
                    <div>ساعات العمل: {dept.hours}</div>
                    {dept.latitude && dept.longitude && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        موقع محدد على الخريطة
                      </div>
                    )}
                    {dept.google_maps_url && (
                      <div className="mt-2">
                        <a 
                          href={dept.google_maps_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <MapPin className="h-4 w-4" />
                          عرض على خرائط جوجل
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(dept)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  تعديل
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(dept.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};