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
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  subjects: string[];
  experience_years: number;
  education_level: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  image_url?: string;
  hourly_rate?: number;
  availability: string[];
  teaching_methods: string[];
  languages?: string[];
  online_teaching: boolean;
  home_visits: boolean;
  group_teaching: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TeachersManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    specialization: 'academic',
    subjects: [] as string[],
    experience_years: 0,
    education_level: 'bachelor',
    address: '',
    phone: '',
    email: '',
    description: '',
    image_url: '',
    hourly_rate: 0,
    availability: [] as string[],
    teaching_methods: [] as string[],
    languages: [] as string[],
    online_teaching: false,
    home_visits: false,
    group_teaching: false,
    rating: 0,
    is_active: true
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, selectedSpecialization]);

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المدرسين',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = [...teachers];

    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(teacher => teacher.specialization === selectedSpecialization);
    }

    setFilteredTeachers(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTeacher) {
        const { error } = await supabase
          .from('teachers')
          .update(formData)
          .eq('id', editingTeacher.id);

        if (error) throw error;
        
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث المدرس بنجاح'
        });
      } else {
        const { error } = await supabase
          .from('teachers')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة المدرس بنجاح'
        });
      }

      setIsDialogOpen(false);
      setEditingTeacher(null);
      resetForm();
      loadTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ المدرس',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      specialization: teacher.specialization,
      subjects: teacher.subjects || [],
      experience_years: teacher.experience_years || 0,
      education_level: teacher.education_level || 'bachelor',
      address: teacher.address || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      description: teacher.description || '',
      image_url: teacher.image_url || '',
      hourly_rate: teacher.hourly_rate || 0,
      availability: teacher.availability || [],
      teaching_methods: teacher.teaching_methods || [],
      languages: teacher.languages || [],
      online_teaching: teacher.online_teaching,
      home_visits: teacher.home_visits,
      group_teaching: teacher.group_teaching,
      rating: teacher.rating,
      is_active: teacher.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المدرس بنجاح'
      });
      
      loadTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف المدرس',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المدرس`
      });
      
      loadTeachers();
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة المدرس',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: 'academic',
      subjects: [],
      experience_years: 0,
      education_level: 'bachelor',
      address: '',
      phone: '',
      email: '',
      description: '',
      image_url: '',
      hourly_rate: 0,
      availability: [],
      teaching_methods: [],
      languages: [],
      online_teaching: false,
      home_visits: false,
      group_teaching: false,
      rating: 0,
      is_active: true
    });
  };

  const openAddDialog = () => {
    setEditingTeacher(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getSpecializationLabel = (specialization: string) => {
    const specializations: Record<string, string> = {
      academic: 'أكاديمي',
      language: 'لغات',
      computer: 'حاسوب',
      art: 'فنون',
      music: 'موسيقى',
      sports: 'رياضة',
      religious: 'ديني'
    };
    return specializations[specialization] || specialization;
  };

  const getEducationLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      bachelor: 'بكالوريوس',
      master: 'ماجستير',
      phd: 'دكتوراه',
      diploma: 'دبلوم'
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
          <h1 className="text-3xl font-bold">إدارة المدرسين</h1>
          <p className="text-muted-foreground">إدارة المدرسين والدروس الخصوصية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة مدرس جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? 'تعديل المدرس' : 'إضافة مدرس جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingTeacher ? 'قم بتعديل بيانات المدرس' : 'أدخل بيانات المدرس الجديد'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم المدرس *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="مثال: أحمد محمد"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">التخصص *</Label>
                  <Select value={formData.specialization} onValueChange={(value) => setFormData({ ...formData, specialization: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">أكاديمي</SelectItem>
                      <SelectItem value="language">لغات</SelectItem>
                      <SelectItem value="computer">حاسوب</SelectItem>
                      <SelectItem value="art">فنون</SelectItem>
                      <SelectItem value="music">موسيقى</SelectItem>
                      <SelectItem value="sports">رياضة</SelectItem>
                      <SelectItem value="religious">ديني</SelectItem>
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
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="education_level">المؤهل العلمي</Label>
                  <Select value={formData.education_level} onValueChange={(value) => setFormData({ ...formData, education_level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المؤهل" />
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
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                  />
                </div>
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
              </div>

              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="عنوان المدرس"
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف المدرس وخبراته"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourly_rate">سعر الساعة (جنيه)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: parseInt(e.target.value) || 0 })}
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
                <h4 className="text-lg font-medium">طرق التدريس المتاحة</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="online_teaching"
                      checked={formData.online_teaching}
                      onCheckedChange={(checked) => setFormData({ ...formData, online_teaching: checked })}
                    />
                    <Label htmlFor="online_teaching">تدريس أونلاين</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="home_visits"
                      checked={formData.home_visits}
                      onCheckedChange={(checked) => setFormData({ ...formData, home_visits: checked })}
                    />
                    <Label htmlFor="home_visits">زيارات منزلية</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="group_teaching"
                      checked={formData.group_teaching}
                      onCheckedChange={(checked) => setFormData({ ...formData, group_teaching: checked })}
                    />
                    <Label htmlFor="group_teaching">تدريس جماعي</Label>
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
                  {editingTeacher ? 'تحديث' : 'إضافة'}
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
          <h3 className="text-lg font-semibold text-gray-900">فلترة المدرسين</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث عن مدرس..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">التخصص</label>
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="اختر التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                <SelectItem value="academic">أكاديمي</SelectItem>
                <SelectItem value="language">لغات</SelectItem>
                <SelectItem value="computer">حاسوب</SelectItem>
                <SelectItem value="art">فنون</SelectItem>
                <SelectItem value="music">موسيقى</SelectItem>
                <SelectItem value="sports">رياضة</SelectItem>
                <SelectItem value="religious">ديني</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">النتائج</label>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredTeachers.length}</div>
              <div className="text-sm text-gray-600">مدرس</div>
            </div>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>المدرسين ({filteredTeachers.length})</CardTitle>
          <CardDescription>قائمة بجميع المدرسين في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المدرس</TableHead>
                <TableHead>التخصص</TableHead>
                <TableHead>الخبرة</TableHead>
                <TableHead>المؤهل</TableHead>
                <TableHead>سعر الساعة</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {teacher.image_url ? (
                        <img
                          src={teacher.image_url}
                          alt={teacher.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-muted-foreground">{teacher.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getSpecializationLabel(teacher.specialization)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{teacher.experience_years} سنة</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getEducationLevelLabel(teacher.education_level)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{teacher.hourly_rate} جنيه</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{teacher.rating}</span>
                      <span className="text-xs text-muted-foreground">/5</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                      {teacher.is_active ? 'فعال' : 'غير فعال'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(teacher.id, teacher.is_active)}
                      >
                        {teacher.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(teacher)}
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
                              هل أنت متأكد من حذف المدرس "{teacher.name}"؟ 
                              هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(teacher.id)}>
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

export default TeachersManagement;
