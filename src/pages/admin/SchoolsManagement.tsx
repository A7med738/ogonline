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
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  category_id?: string;
  created_at: string;
  updated_at: string;
  school_categories?: {
    id: string;
    name_ar: string;
    name_en: string;
    color: string;
    icon?: string;
  };
}

interface SchoolCategory {
  id: string;
  name_ar: string;
  name_en: string;
  color: string;
  icon?: string;
  is_active: boolean;
}

const SchoolsManagement: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    level: 'all',
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
    curriculum: '',
    languages: [] as string[],
    facilities: [] as string[],
    transportation: false,
    boarding: false,
    special_needs: false,
    rating: 0,
    is_active: true,
    category_id: ''
  });

  useEffect(() => {
    loadSchools();
    loadCategories();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [schools, searchTerm, selectedCategory]);

  const loadSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          school_categories (
            id,
            name_ar,
            name_en,
            color,
            icon
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المدارس',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('school_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterSchools = () => {
    let filtered = [...schools];

    if (searchTerm) {
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(school => school.category_id === selectedCategory);
    }

    setFilteredSchools(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSchool) {
        // تحديث مدرسة موجودة
        const { error } = await supabase
          .from('schools')
          .update(formData)
          .eq('id', editingSchool.id);

        if (error) throw error;
        
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث المدرسة بنجاح'
        });
      } else {
        // إضافة مدرسة جديدة
        const { error } = await supabase
          .from('schools')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة المدرسة بنجاح'
        });
      }

      setIsDialogOpen(false);
      setEditingSchool(null);
      resetForm();
      loadSchools();
    } catch (error) {
      console.error('Error saving school:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ المدرسة',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      type: school.type,
      level: school.level,
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      website: school.website || '',
      description: school.description || '',
      image_url: school.image_url || '',
      logo_url: school.logo_url || '',
      established_year: school.established_year || new Date().getFullYear(),
      capacity: school.capacity || 0,
      fees_range: school.fees_range || '',
      curriculum: school.curriculum || '',
      languages: school.languages || [],
      facilities: school.facilities || [],
      transportation: school.transportation,
      boarding: school.boarding,
      special_needs: school.special_needs,
      rating: school.rating,
      is_active: school.is_active,
      category_id: school.category_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المدرسة بنجاح'
      });
      
      loadSchools();
    } catch (error) {
      console.error('Error deleting school:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف المدرسة',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المدرسة`
      });
      
      loadSchools();
    } catch (error) {
      console.error('Error toggling school status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة المدرسة',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'public',
      level: 'all',
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
      curriculum: '',
      languages: [],
      facilities: [],
      transportation: false,
      boarding: false,
      special_needs: false,
      rating: 0,
      is_active: true,
      category_id: ''
    });
  };

  const openAddDialog = () => {
    setEditingSchool(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      public: 'حكومية',
      private: 'خاصة',
      international: 'دولية',
      religious: 'دينية'
    };
    return types[type] || type;
  };

  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      kindergarten: 'روضة',
      primary: 'ابتدائي',
      preparatory: 'إعدادي',
      secondary: 'ثانوي',
      all: 'جميع المراحل'
    };
    return levels[level] || level;
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
          <h1 className="text-3xl font-bold">إدارة المدارس</h1>
          <p className="text-muted-foreground">إدارة المدارس وتصنيفها حسب الفئات المختلفة</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة مدرسة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSchool ? 'تعديل المدرسة' : 'إضافة مدرسة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {editingSchool ? 'قم بتعديل بيانات المدرسة' : 'أدخل بيانات المدرسة الجديدة'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم المدرسة *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="مثال: مدرسة النهضة"
                  />
                </div>
                <div>
                  <Label htmlFor="type">نوع المدرسة *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">المرحلة التعليمية *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
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
                <div>
                  <Label htmlFor="category_id">فئة المدرسة</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة المدرسة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span>{category.name_ar}</span>
                          </div>
                        </SelectItem>
                      ))}
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
                    placeholder="عنوان المدرسة"
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
                  placeholder="وصف المدرسة"
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
                  placeholder="مثال: 5000 - 15000 جنيه"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">المرافق والخدمات</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transportation"
                      checked={formData.transportation}
                      onCheckedChange={(checked) => setFormData({ ...formData, transportation: checked })}
                    />
                    <Label htmlFor="transportation">نقل مدرسي</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="boarding"
                      checked={formData.boarding}
                      onCheckedChange={(checked) => setFormData({ ...formData, boarding: checked })}
                    />
                    <Label htmlFor="boarding">إقامة داخلية</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="special_needs"
                      checked={formData.special_needs}
                      onCheckedChange={(checked) => setFormData({ ...formData, special_needs: checked })}
                    />
                    <Label htmlFor="special_needs">احتياجات خاصة</Label>
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
                  {editingSchool ? 'تحديث' : 'إضافة'}
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
          <h3 className="text-lg font-semibold text-gray-900">فلترة المدارس</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث عن مدرسة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">فئة المدرسة</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="اختر فئة المدرسة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.name_ar}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">النتائج</label>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredSchools.length}</div>
              <div className="text-sm text-gray-600">مدرسة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>المدارس ({filteredSchools.length})</CardTitle>
          <CardDescription>قائمة بجميع المدارس في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المدرسة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>المرحلة</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {school.logo_url ? (
                        <img
                          src={school.logo_url}
                          alt={school.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{school.name}</div>
                        <div className="text-sm text-muted-foreground">{school.address}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTypeLabel(school.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {school.school_categories ? (
                      <Badge 
                        variant="outline"
                        style={{ 
                          backgroundColor: school.school_categories.color + '20',
                          color: school.school_categories.color,
                          borderColor: school.school_categories.color
                        }}
                      >
                        {school.school_categories.name_ar}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">غير محدد</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getLevelLabel(school.level)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{school.rating}</span>
                      <span className="text-xs text-muted-foreground">/5</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={school.is_active ? 'default' : 'secondary'}>
                      {school.is_active ? 'فعال' : 'غير فعال'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(school.id, school.is_active)}
                      >
                        {school.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(school)}
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
                              هل أنت متأكد من حذف المدرسة "{school.name}"؟ 
                              هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(school.id)}>
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

export default SchoolsManagement;
