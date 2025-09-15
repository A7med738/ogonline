import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { GraduationCap, Baby, BookOpen, Users, Plus, Edit, Trash2, Eye, Star, MapPin, Phone, Mail, Globe, Clock, Users as UsersIcon, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface School {
  id: string;
  name: string;
  type: string;
  level: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  capacity?: number;
  fees_range?: string;
  curriculum?: string;
  languages?: string[];
  facilities?: string[];
  transportation: boolean;
  boarding: boolean;
  special_needs: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Nursery {
  id: string;
  name: string;
  type: string;
  age_groups: string[];
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  capacity?: number;
  fees_range?: string;
  operating_hours?: string;
  facilities?: string[];
  transportation: boolean;
  meals_included: boolean;
  medical_care: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EducationalCenter {
  id: string;
  name: string;
  type: string;
  subjects: string[];
  age_groups: string[];
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  capacity?: number;
  fees_range?: string;
  class_schedule?: string;
  facilities?: string[];
  online_classes: boolean;
  individual_sessions: boolean;
  group_sessions: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  subjects: string[];
  education_level: string;
  experience_years: number;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  image_url?: string;
  hourly_rate?: number;
  available_hours?: string;
  teaching_methods: string[];
  age_groups: string[];
  languages: string[];
  qualifications: string[];
  rating: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EducationalServicesManagement = () => {
  const [activeTab, setActiveTab] = useState('schools');
  const [schools, setSchools] = useState<School[]>([]);
  const [nurseries, setNurseries] = useState<Nursery[]>([]);
  const [centers, setCenters] = useState<EducationalCenter[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'schools':
          const { data: schoolsData } = await supabase
            .from('schools')
            .select('*')
            .order('created_at', { ascending: false });
          setSchools(schoolsData || []);
          break;
        case 'nurseries':
          const { data: nurseriesData } = await supabase
            .from('nurseries')
            .select('*')
            .order('created_at', { ascending: false });
          setNurseries(nurseriesData || []);
          break;
        case 'centers':
          const { data: centersData } = await supabase
            .from('educational_centers')
            .select('*')
            .order('created_at', { ascending: false });
          setCenters(centersData || []);
          break;
        case 'teachers':
          const { data: teachersData } = await supabase
            .from('teachers')
            .select('*')
            .order('created_at', { ascending: false });
          setTeachers(teachersData || []);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف العنصر بنجاح',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف العنصر',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      const table = getTableName();
      const data = { ...formData };

      if (editingItem) {
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث العنصر بنجاح',
        });
      } else {
        const { error } = await supabase
          .from(table)
          .insert([data]);
        if (error) throw error;
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة العنصر بنجاح',
        });
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ العنصر',
        variant: 'destructive',
      });
    }
  };

  const getTableName = () => {
    switch (activeTab) {
      case 'schools': return 'schools';
      case 'nurseries': return 'nurseries';
      case 'centers': return 'educational_centers';
      case 'teachers': return 'teachers';
      default: return 'schools';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const renderSchools = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schools.map((school) => (
        <Card key={school.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">{school.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mr-2">{school.type}</Badge>
                    <Badge variant="outline">{school.level}</Badge>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(school.rating)}
                <span className="text-sm text-gray-500">({school.rating})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {school.address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{school.address}</span>
                </div>
              )}
              {school.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{school.phone}</span>
                </div>
              )}
              {school.fees_range && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{school.fees_range}</span>
                </div>
              )}
              {school.capacity && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <UsersIcon className="h-4 w-4" />
                  <span>السعة: {school.capacity}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Switch checked={school.is_active} disabled />
                <span className={school.is_active ? 'text-green-600' : 'text-red-600'}>
                  {school.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleEdit(school)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(school.id, 'schools')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderNurseries = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nurseries.map((nursery) => (
        <Card key={nursery.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Baby className="h-6 w-6 text-pink-600" />
                <div>
                  <CardTitle className="text-lg">{nursery.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mr-2">{nursery.type}</Badge>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(nursery.rating)}
                <span className="text-sm text-gray-500">({nursery.rating})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nursery.address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{nursery.address}</span>
                </div>
              )}
              {nursery.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{nursery.phone}</span>
                </div>
              )}
              {nursery.fees_range && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{nursery.fees_range}</span>
                </div>
              )}
              {nursery.operating_hours && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{nursery.operating_hours}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Switch checked={nursery.is_active} disabled />
                <span className={nursery.is_active ? 'text-green-600' : 'text-red-600'}>
                  {nursery.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleEdit(nursery)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(nursery.id, 'nurseries')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCenters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {centers.map((center) => (
        <Card key={center.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle className="text-lg">{center.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mr-2">{center.type}</Badge>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(center.rating)}
                <span className="text-sm text-gray-500">({center.rating})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {center.address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{center.address}</span>
                </div>
              )}
              {center.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{center.phone}</span>
                </div>
              )}
              {center.fees_range && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{center.fees_range}</span>
                </div>
              )}
              {center.class_schedule && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{center.class_schedule}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Switch checked={center.is_active} disabled />
                <span className={center.is_active ? 'text-green-600' : 'text-red-600'}>
                  {center.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleEdit(center)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(center.id, 'educational_centers')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTeachers = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teachers.map((teacher) => (
        <Card key={teacher.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle className="text-lg">{teacher.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mr-2">{teacher.specialization}</Badge>
                    {teacher.is_verified && <Badge variant="default" className="bg-green-600">معتمد</Badge>}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(teacher.rating)}
                <span className="text-sm text-gray-500">({teacher.rating})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teacher.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{teacher.phone}</span>
                </div>
              )}
              {teacher.hourly_rate && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{teacher.hourly_rate} جنيه/ساعة</span>
                </div>
              )}
              {teacher.available_hours && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{teacher.available_hours}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Switch checked={teacher.is_active} disabled />
                <span className={teacher.is_active ? 'text-green-600' : 'text-red-600'}>
                  {teacher.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleEdit(teacher)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(teacher.id, 'teachers')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderForm = () => {
    const commonFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل الاسم"
            />
          </div>
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="أدخل رقم الهاتف"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>
          <div>
            <Label htmlFor="website">الموقع الإلكتروني</Label>
            <Input
              id="website"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="أدخل الموقع الإلكتروني"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="address">العنوان</Label>
          <Input
            id="address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="أدخل العنوان"
          />
        </div>
        <div>
          <Label htmlFor="description">الوصف</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="أدخل الوصف"
            rows={3}
          />
        </div>
      </>
    );

    switch (activeTab) {
      case 'schools':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">نوع المدرسة *</Label>
                <Select value={formData.type || ''} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المدرسة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">حكومية</SelectItem>
                    <SelectItem value="private">خاصة</SelectItem>
                    <SelectItem value="international">دولية</SelectItem>
                    <SelectItem value="religious">دينية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">المرحلة التعليمية *</Label>
                <Select value={formData.level || ''} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المرحلة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kindergarten">روضة</SelectItem>
                    <SelectItem value="primary">ابتدائي</SelectItem>
                    <SelectItem value="preparatory">إعدادي</SelectItem>
                    <SelectItem value="secondary">ثانوي</SelectItem>
                    <SelectItem value="all">جميع المراحل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="curriculum">المنهج</Label>
                <Input
                  id="curriculum"
                  value={formData.curriculum || ''}
                  onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                  placeholder="مثل: مصري، أمريكي، بريطاني"
                />
              </div>
              <div>
                <Label htmlFor="fees_range">نطاق الرسوم</Label>
                <Input
                  id="fees_range"
                  value={formData.fees_range || ''}
                  onChange={(e) => setFormData({ ...formData, fees_range: e.target.value })}
                  placeholder="مثل: 1000-5000 جنيه"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">السعة</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="عدد الطلاب"
                />
              </div>
              <div>
                <Label htmlFor="established_year">سنة التأسيس</Label>
                <Input
                  id="established_year"
                  type="number"
                  value={formData.established_year || ''}
                  onChange={(e) => setFormData({ ...formData, established_year: parseInt(e.target.value) || 0 })}
                  placeholder="سنة التأسيس"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.transportation || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, transportation: checked })}
                />
                <Label>نقل مدرسي</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.boarding || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, boarding: checked })}
                />
                <Label>إقامة داخلية</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.special_needs || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, special_needs: checked })}
                />
                <Label>احتياجات خاصة</Label>
              </div>
            </div>
          </>
        );

      case 'nurseries':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">نوع الحضانة *</Label>
                <Select value={formData.type || ''} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الحضانة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">خاصة</SelectItem>
                    <SelectItem value="government">حكومية</SelectItem>
                    <SelectItem value="community">مجتمعية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fees_range">نطاق الرسوم</Label>
                <Input
                  id="fees_range"
                  value={formData.fees_range || ''}
                  onChange={(e) => setFormData({ ...formData, fees_range: e.target.value })}
                  placeholder="مثل: 500-1500 جنيه"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="operating_hours">ساعات العمل</Label>
                <Input
                  id="operating_hours"
                  value={formData.operating_hours || ''}
                  onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                  placeholder="مثل: 7:00 AM - 4:00 PM"
                />
              </div>
              <div>
                <Label htmlFor="capacity">السعة</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="عدد الأطفال"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.transportation || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, transportation: checked })}
                />
                <Label>نقل</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.meals_included || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, meals_included: checked })}
                />
                <Label>وجبات</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.medical_care || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, medical_care: checked })}
                />
                <Label>رعاية طبية</Label>
              </div>
            </div>
          </>
        );

      case 'centers':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">نوع المركز *</Label>
                <Select value={formData.type || ''} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المركز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutoring">دروس خصوصية</SelectItem>
                    <SelectItem value="language">لغات</SelectItem>
                    <SelectItem value="computer">كمبيوتر</SelectItem>
                    <SelectItem value="art">فنون</SelectItem>
                    <SelectItem value="music">موسيقى</SelectItem>
                    <SelectItem value="sports">رياضة</SelectItem>
                    <SelectItem value="religious">ديني</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fees_range">نطاق الرسوم</Label>
                <Input
                  id="fees_range"
                  value={formData.fees_range || ''}
                  onChange={(e) => setFormData({ ...formData, fees_range: e.target.value })}
                  placeholder="مثل: 50-100 جنيه/ساعة"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class_schedule">جدول الحصص</Label>
                <Input
                  id="class_schedule"
                  value={formData.class_schedule || ''}
                  onChange={(e) => setFormData({ ...formData, class_schedule: e.target.value })}
                  placeholder="مثل: Monday-Friday 4:00-8:00 PM"
                />
              </div>
              <div>
                <Label htmlFor="capacity">السعة</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="عدد الطلاب"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.online_classes || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, online_classes: checked })}
                />
                <Label>حصص أونلاين</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.individual_sessions || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, individual_sessions: checked })}
                />
                <Label>حصص فردية</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.group_sessions || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, group_sessions: checked })}
                />
                <Label>حصص جماعية</Label>
              </div>
            </div>
          </>
        );

      case 'teachers':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialization">التخصص *</Label>
                <Input
                  id="specialization"
                  value={formData.specialization || ''}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="مثل: رياضيات، فيزياء، إنجليزية"
                />
              </div>
              <div>
                <Label htmlFor="education_level">المستوى التعليمي *</Label>
                <Select value={formData.education_level || ''} onValueChange={(value) => setFormData({ ...formData, education_level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى التعليمي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diploma">دبلوم</SelectItem>
                    <SelectItem value="bachelor">بكالوريوس</SelectItem>
                    <SelectItem value="master">ماجستير</SelectItem>
                    <SelectItem value="phd">دكتوراه</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_years">سنوات الخبرة</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years || ''}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  placeholder="عدد سنوات الخبرة"
                />
              </div>
              <div>
                <Label htmlFor="hourly_rate">السعر بالساعة</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={formData.hourly_rate || ''}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                  placeholder="السعر بالجنيه المصري"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="available_hours">الساعات المتاحة</Label>
              <Input
                id="available_hours"
                value={formData.available_hours || ''}
                onChange={(e) => setFormData({ ...formData, available_hours: e.target.value })}
                placeholder="مثل: 4:00-8:00 PM"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_verified || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                />
                <Label>معتمد</Label>
              </div>
            </div>
          </>
        );

      default:
        return commonFields;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الخدمات التعليمية</h1>
          <p className="text-gray-600 mt-2">إدارة المدارس، الحضانات، المراكز التعليمية، والمدرسين</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              إضافة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'تعديل' : 'إضافة'} {activeTab === 'schools' ? 'مدرسة' : activeTab === 'nurseries' ? 'حضانة' : activeTab === 'centers' ? 'مركز تعليمي' : 'مدرس'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'قم بتعديل البيانات أدناه' : 'أدخل البيانات المطلوبة أدناه'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {renderForm()}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                {editingItem ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schools" className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4" />
            <span>المدارس</span>
          </TabsTrigger>
          <TabsTrigger value="nurseries" className="flex items-center space-x-2">
            <Baby className="h-4 w-4" />
            <span>الحضانات</span>
          </TabsTrigger>
          <TabsTrigger value="centers" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>المراكز</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>المدرسين</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schools" className="mt-6">
          {schools.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مدارس</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة مدرسة جديدة</p>
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة مدرسة
              </Button>
            </div>
          ) : (
            renderSchools()
          )}
        </TabsContent>

        <TabsContent value="nurseries" className="mt-6">
          {nurseries.length === 0 ? (
            <div className="text-center py-12">
              <Baby className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حضانات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة حضانة جديدة</p>
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة حضانة
              </Button>
            </div>
          ) : (
            renderNurseries()
          )}
        </TabsContent>

        <TabsContent value="centers" className="mt-6">
          {centers.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراكز تعليمية</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة مركز تعليمي جديد</p>
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة مركز
              </Button>
            </div>
          ) : (
            renderCenters()
          )}
        </TabsContent>

        <TabsContent value="teachers" className="mt-6">
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مدرسين</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة مدرس جديد</p>
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة مدرس
              </Button>
            </div>
          ) : (
            renderTeachers()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationalServicesManagement;
