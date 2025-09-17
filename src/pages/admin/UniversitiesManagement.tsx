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
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface University {
  id: string;
  name: string;
  type: string;
  accreditation: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  student_capacity?: number;
  faculties: string[];
  programs: string[];
  languages?: string[];
  facilities?: string[];
  dormitory: boolean;
  transportation: boolean;
  research_centers: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UniversitiesManagement: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'public',
    accreditation: 'ministry',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    image_url: '',
    logo_url: '',
    established_year: new Date().getFullYear(),
    student_capacity: 0,
    faculties: [] as string[],
    programs: [] as string[],
    languages: [] as string[],
    facilities: [] as string[],
    dormitory: false,
    transportation: false,
    research_centers: false,
    rating: 0,
    is_active: true
  });

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    filterUniversities();
  }, [universities, searchTerm, selectedType]);

  const loadUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUniversities(data || []);
    } catch (error) {
      console.error('Error loading universities:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الجامعات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUniversities = () => {
    let filtered = [...universities];

    if (searchTerm) {
      filtered = filtered.filter(university =>
        university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(university => university.type === selectedType);
    }

    setFilteredUniversities(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUniversity) {
        const { error } = await supabase
          .from('universities')
          .update(formData)
          .eq('id', editingUniversity.id);

        if (error) throw error;
        
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث الجامعة بنجاح'
        });
      } else {
        const { error } = await supabase
          .from('universities')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة الجامعة بنجاح'
        });
      }

      setIsDialogOpen(false);
      setEditingUniversity(null);
      resetForm();
      loadUniversities();
    } catch (error) {
      console.error('Error saving university:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الجامعة',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (university: University) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name,
      type: university.type,
      accreditation: university.accreditation,
      address: university.address || '',
      phone: university.phone || '',
      email: university.email || '',
      website: university.website || '',
      description: university.description || '',
      image_url: university.image_url || '',
      logo_url: university.logo_url || '',
      established_year: university.established_year || new Date().getFullYear(),
      student_capacity: university.student_capacity || 0,
      faculties: university.faculties || [],
      programs: university.programs || [],
      languages: university.languages || [],
      facilities: university.facilities || [],
      dormitory: university.dormitory,
      transportation: university.transportation,
      research_centers: university.research_centers,
      rating: university.rating,
      is_active: university.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('universities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الجامعة بنجاح'
      });
      
      loadUniversities();
    } catch (error) {
      console.error('Error deleting university:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الجامعة',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('universities')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الجامعة`
      });
      
      loadUniversities();
    } catch (error) {
      console.error('Error toggling university status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الجامعة',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'public',
      accreditation: 'ministry',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      image_url: '',
      logo_url: '',
      established_year: new Date().getFullYear(),
      student_capacity: 0,
      faculties: [],
      programs: [],
      languages: [],
      facilities: [],
      dormitory: false,
      transportation: false,
      research_centers: false,
      rating: 0,
      is_active: true
    });
  };

  const openAddDialog = () => {
    setEditingUniversity(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      public: 'حكومية',
      private: 'خاصة',
      international: 'دولية',
      technical: 'تقنية'
    };
    return types[type] || type;
  };

  const getAccreditationLabel = (accreditation: string) => {
    const accreditations: Record<string, string> = {
      ministry: 'وزارة التعليم العالي',
      international: 'اعتماد دولي',
      regional: 'اعتماد إقليمي',
      national: 'اعتماد وطني'
    };
    return accreditations[accreditation] || accreditation;
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
          <h1 className="text-3xl font-bold">إدارة الجامعات</h1>
          <p className="text-muted-foreground">إدارة الجامعات والمعاهد العليا</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة جامعة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUniversity ? 'تعديل الجامعة' : 'إضافة جامعة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {editingUniversity ? 'قم بتعديل بيانات الجامعة' : 'أدخل بيانات الجامعة الجديدة'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم الجامعة *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="مثال: جامعة القاهرة"
                  />
                </div>
                <div>
                  <Label htmlFor="type">نوع الجامعة *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الجامعة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">حكومية</SelectItem>
                      <SelectItem value="private">خاصة</SelectItem>
                      <SelectItem value="international">دولية</SelectItem>
                      <SelectItem value="technical">تقنية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accreditation">الاعتماد</Label>
                  <Select value={formData.accreditation} onValueChange={(value) => setFormData({ ...formData, accreditation: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الاعتماد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ministry">وزارة التعليم العالي</SelectItem>
                      <SelectItem value="international">اعتماد دولي</SelectItem>
                      <SelectItem value="regional">اعتماد إقليمي</SelectItem>
                      <SelectItem value="national">اعتماد وطني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="عنوان الجامعة"
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
                  placeholder="وصف الجامعة"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student_capacity">السعة الطلابية</Label>
                  <Input
                    id="student_capacity"
                    type="number"
                    value={formData.student_capacity}
                    onChange={(e) => setFormData({ ...formData, student_capacity: parseInt(e.target.value) || 0 })}
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

              <div className="space-y-4">
                <h4 className="text-lg font-medium">المرافق والخدمات</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dormitory"
                      checked={formData.dormitory}
                      onCheckedChange={(checked) => setFormData({ ...formData, dormitory: checked })}
                    />
                    <Label htmlFor="dormitory">سكن طلابي</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transportation"
                      checked={formData.transportation}
                      onCheckedChange={(checked) => setFormData({ ...formData, transportation: checked })}
                    />
                    <Label htmlFor="transportation">نقل</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="research_centers"
                      checked={formData.research_centers}
                      onCheckedChange={(checked) => setFormData({ ...formData, research_centers: checked })}
                    />
                    <Label htmlFor="research_centers">مراكز بحثية</Label>
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
                  {editingUniversity ? 'تحديث' : 'إضافة'}
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
          <h3 className="text-lg font-semibold text-gray-900">فلترة الجامعات</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث عن جامعة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">نوع الجامعة</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الجامعة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="public">حكومية</SelectItem>
                <SelectItem value="private">خاصة</SelectItem>
                <SelectItem value="international">دولية</SelectItem>
                <SelectItem value="technical">تقنية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">النتائج</label>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredUniversities.length}</div>
              <div className="text-sm text-gray-600">جامعة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Universities Table */}
      <Card>
        <CardHeader>
          <CardTitle>الجامعات ({filteredUniversities.length})</CardTitle>
          <CardDescription>قائمة بجميع الجامعات في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الجامعة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الاعتماد</TableHead>
                <TableHead>السعة</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUniversities.map((university) => (
                <TableRow key={university.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {university.logo_url ? (
                        <img
                          src={university.logo_url}
                          alt={university.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{university.name}</div>
                        <div className="text-sm text-muted-foreground">{university.address}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTypeLabel(university.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getAccreditationLabel(university.accreditation)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{university.student_capacity || 0}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{university.rating}</span>
                      <span className="text-xs text-muted-foreground">/5</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={university.is_active ? 'default' : 'secondary'}>
                      {university.is_active ? 'فعال' : 'غير فعال'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(university.id, university.is_active)}
                      >
                        {university.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(university)}
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
                              هل أنت متأكد من حذف الجامعة "{university.name}"؟ 
                              هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(university.id)}>
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

export default UniversitiesManagement;
