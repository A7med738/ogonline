import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EducationalCenter {
  id: string;
  name: string;
  type: string;
  subjects: string[];
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
  languages?: string[];
  facilities?: string[];
  online_classes: boolean;
  group_study: boolean;
  individual_tutoring: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EducationalCentersManagement: React.FC = () => {
  const [centers, setCenters] = useState<EducationalCenter[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<EducationalCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<EducationalCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'tutoring',
    subjects: [] as string[],
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    image_url: '',
    logo_url: '',
    established_year: new Date().getFullYear(),
    capacity: 0,
    fees_range: '',
    operating_hours: '',
    languages: [] as string[],
    facilities: [] as string[],
    online_classes: false,
    group_study: false,
    individual_tutoring: false,
    rating: 0,
    is_active: true
  });

  useEffect(() => {
    loadCenters();
  }, []);

  useEffect(() => {
    filterCenters();
  }, [centers, searchTerm, selectedType]);

  const loadCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('educational_centers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCenters(data || []);
    } catch (error) {
      console.error('Error loading centers:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل السناتر',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCenters = () => {
    let filtered = [...centers];

    if (searchTerm) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(center => center.type === selectedType);
    }

    setFilteredCenters(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCenter) {
        const { error } = await supabase
          .from('educational_centers')
          .update(formData)
          .eq('id', editingCenter.id);

        if (error) throw error;
        
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث السنتر بنجاح'
        });
      } else {
        const { error } = await supabase
          .from('educational_centers')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة السنتر بنجاح'
        });
      }

      setIsDialogOpen(false);
      setEditingCenter(null);
      resetForm();
      loadCenters();
    } catch (error) {
      console.error('Error saving center:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ السنتر',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (center: EducationalCenter) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      type: center.type,
      subjects: center.subjects || [],
      address: center.address || '',
      phone: center.phone || '',
      email: center.email || '',
      website: center.website || '',
      description: center.description || '',
      image_url: center.image_url || '',
      logo_url: center.logo_url || '',
      established_year: center.established_year || new Date().getFullYear(),
      capacity: center.capacity || 0,
      fees_range: center.fees_range || '',
      operating_hours: center.operating_hours || '',
      languages: center.languages || [],
      facilities: center.facilities || [],
      online_classes: center.online_classes,
      group_study: center.group_study,
      individual_tutoring: center.individual_tutoring,
      rating: center.rating,
      is_active: center.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('educational_centers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف السنتر بنجاح'
      });
      
      loadCenters();
    } catch (error) {
      console.error('Error deleting center:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف السنتر',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('educational_centers')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} السنتر`
      });
      
      loadCenters();
    } catch (error) {
      console.error('Error toggling center status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة السنتر',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'tutoring',
      subjects: [],
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      image_url: '',
      logo_url: '',
      established_year: new Date().getFullYear(),
      capacity: 0,
      fees_range: '',
      operating_hours: '',
      languages: [],
      facilities: [],
      online_classes: false,
      group_study: false,
      individual_tutoring: false,
      rating: 0,
      is_active: true
    });
  };

  const openAddDialog = () => {
    setEditingCenter(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      tutoring: 'دروس خصوصية',
      review: 'مراجعة',
      exam_prep: 'تحضير امتحانات',
      language: 'لغات',
      computer: 'حاسوب',
      art: 'فنون',
      music: 'موسيقى'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة السناتر التعليمية</h1>
          <p className="text-muted-foreground">إدارة السناتر ومراكز التعليم الإضافي</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة سنتر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCenter ? 'تعديل السنتر' : 'إضافة سنتر جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingCenter ? 'قم بتعديل بيانات السنتر' : 'أدخل بيانات السنتر الجديد'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم السنتر *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="مثال: سنتر النجاح"
                  />
                </div>
                <div>
                  <Label htmlFor="type">نوع السنتر *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع السنتر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutoring">دروس خصوصية</SelectItem>
                      <SelectItem value="review">مراجعة</SelectItem>
                      <SelectItem value="exam_prep">تحضير امتحانات</SelectItem>
                      <SelectItem value="language">لغات</SelectItem>
                      <SelectItem value="computer">حاسوب</SelectItem>
                      <SelectItem value="art">فنون</SelectItem>
                      <SelectItem value="music">موسيقى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="عنوان السنتر"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="البريد الإلكتروني"
                  />
                </div>
                <div>
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="الموقع الإلكتروني"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف السنتر"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="established_year">سنة التأسيس</Label>
                  <Input
                    id="established_year"
                    type="number"
                    value={formData.established_year}
                    onChange={(e) => setFormData({ ...formData, established_year: parseInt(e.target.value) || 0 })}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">السعة</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">التقييم</Label>
                  <Input
                    id="rating"
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fees_range">نطاق الرسوم</Label>
                <Input
                  id="fees_range"
                  value={formData.fees_range}
                  onChange={(e) => setFormData({ ...formData, fees_range: e.target.value })}
                  placeholder="مثال: 100 - 500 جنيه"
                />
              </div>

              <div>
                <Label htmlFor="operating_hours">ساعات العمل</Label>
                <Input
                  id="operating_hours"
                  value={formData.operating_hours}
                  onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                  placeholder="مثال: 3:00 م - 9:00 م"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">الخدمات المتاحة</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="online_classes"
                      checked={formData.online_classes}
                      onCheckedChange={(checked) => setFormData({ ...formData, online_classes: checked })}
                    />
                    <Label htmlFor="online_classes">دروس أونلاين</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="group_study"
                      checked={formData.group_study}
                      onCheckedChange={(checked) => setFormData({ ...formData, group_study: checked })}
                    />
                    <Label htmlFor="group_study">دراسة جماعية</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="individual_tutoring"
                      checked={formData.individual_tutoring}
                      onCheckedChange={(checked) => setFormData({ ...formData, individual_tutoring: checked })}
                    />
                    <Label htmlFor="individual_tutoring">دروس فردية</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">فعال</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingCenter ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-500 ml-2" />
          <h3 className="text-lg font-semibold text-gray-900">فلترة السناتر</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث عن سنتر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">نوع السنتر</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع السنتر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="tutoring">دروس خصوصية</SelectItem>
                <SelectItem value="review">مراجعة</SelectItem>
                <SelectItem value="exam_prep">تحضير امتحانات</SelectItem>
                <SelectItem value="language">لغات</SelectItem>
                <SelectItem value="computer">حاسوب</SelectItem>
                <SelectItem value="art">فنون</SelectItem>
                <SelectItem value="music">موسيقى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">النتائج</label>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredCenters.length}</div>
              <div className="text-sm text-gray-600">سنتر</div>
            </div>
          </div>
        </div>
      </div>

      {/* Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>السناتر التعليمية ({filteredCenters.length})</CardTitle>
          <CardDescription>قائمة بجميع السناتر في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>السنتر</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>السعة</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCenters.map((center) => (
                <TableRow key={center.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {center.logo_url ? (
                        <img
                          src={center.logo_url}
                          alt={center.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{center.name}</div>
                        <div className="text-sm text-muted-foreground">{center.operating_hours}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTypeLabel(center.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{center.address || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{center.capacity || 0}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{center.rating}</span>
                      <span className="text-xs text-muted-foreground">/5</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={center.is_active ? 'default' : 'secondary'}>
                      {center.is_active ? 'فعال' : 'غير فعال'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(center.id, center.is_active)}
                      >
                        {center.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(center)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف السنتر "{center.name}"؟ 
                              هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(center.id)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationalCentersManagement;
