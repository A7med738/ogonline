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
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SchoolCategory {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  color: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SchoolCategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SchoolCategory | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    color: '#3B82F6',
    icon: '',
    sort_order: 0,
    is_active: true
  });

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('school_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل فئات المدارس',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // تحديث فئة موجودة
        const { error } = await supabase
          .from('school_categories')
          .update(formData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث فئة المدرسة بنجاح'
        });
      } else {
        // إضافة فئة جديدة
        const { error } = await supabase
          .from('school_categories')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة فئة المدرسة بنجاح'
        });
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ فئة المدرسة',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (category: SchoolCategory) => {
    setEditingCategory(category);
    setFormData({
      name_ar: category.name_ar,
      name_en: category.name_en,
      description_ar: category.description_ar || '',
      description_en: category.description_en || '',
      color: category.color,
      icon: category.icon || '',
      sort_order: category.sort_order,
      is_active: category.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('school_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف فئة المدرسة بنجاح'
      });
      
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف فئة المدرسة',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('school_categories')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} فئة المدرسة`
      });
      
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة فئة المدرسة',
        variant: 'destructive'
      });
    }
  };

  const updateSortOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('school_categories')
        .update({ sort_order: newOrder })
        .eq('id', id);

      if (error) throw error;
      
      fetchCategories();
    } catch (error) {
      console.error('Error updating sort order:', error);
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newCategories = [...categories];
      const temp = newCategories[index];
      newCategories[index] = newCategories[index - 1];
      newCategories[index - 1] = temp;
      
      // تحديث ترتيب الفهارس
      newCategories[index].sort_order = index;
      newCategories[index - 1].sort_order = index - 1;
      
      setCategories(newCategories);
      
      // تحديث في قاعدة البيانات
      updateSortOrder(newCategories[index].id, index);
      updateSortOrder(newCategories[index - 1].id, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < categories.length - 1) {
      const newCategories = [...categories];
      const temp = newCategories[index];
      newCategories[index] = newCategories[index + 1];
      newCategories[index + 1] = temp;
      
      // تحديث ترتيب الفهارس
      newCategories[index].sort_order = index;
      newCategories[index + 1].sort_order = index + 1;
      
      setCategories(newCategories);
      
      // تحديث في قاعدة البيانات
      updateSortOrder(newCategories[index].id, index);
      updateSortOrder(newCategories[index + 1].id, index + 1);
    }
  };

  const resetForm = () => {
    setFormData({
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      color: '#3B82F6',
      icon: '',
      sort_order: categories.length,
      is_active: true
    });
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    resetForm();
    setIsDialogOpen(true);
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
          <h1 className="text-3xl font-bold">إدارة فئات المدارس</h1>
          <p className="text-muted-foreground">إدارة وتنظيم فئات المدارس المختلفة</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'تعديل فئة المدرسة' : 'إضافة فئة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'قم بتعديل بيانات فئة المدرسة' : 'أدخل بيانات فئة المدرسة الجديدة'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_ar">الاسم بالعربية *</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                    placeholder="مثال: مدارس حكومية"
                  />
                </div>
                <div>
                  <Label htmlFor="name_en">الاسم بالإنجليزية *</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                    placeholder="Example: Government Schools"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_ar">الوصف بالعربية</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    placeholder="وصف مختصر للفئة"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description_en">الوصف بالإنجليزية</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="Brief description of the category"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="color">اللون</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="icon">الأيقونة</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="مثال: school"
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">ترتيب العرض</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_active">فعال</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingCategory ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>فئات المدارس ({categories.length})</CardTitle>
          <CardDescription>قائمة بجميع فئات المدارس في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الترتيب</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>اللون</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className="px-2 py-1 bg-muted rounded text-sm">
                        {category.sort_order}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDown(index)}
                        disabled={index === categories.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div>
                        <div className="font-medium">{category.name_ar}</div>
                        <div className="text-sm text-muted-foreground">{category.name_en}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm">{category.description_ar || '-'}</div>
                      {category.description_en && (
                        <div className="text-xs text-muted-foreground">{category.description_en}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-mono">{category.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                      {category.is_active ? 'فعال' : 'غير فعال'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(category.id, category.is_active)}
                      >
                        {category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
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
                              هل أنت متأكد من حذف فئة "{category.name_ar}"؟ 
                              هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)}>
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

export default SchoolCategoriesManagement;
