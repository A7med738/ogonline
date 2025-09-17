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
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, Baby } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  languages?: string[];
  facilities?: string[];
  transportation: boolean;
  meals: boolean;
  medical_care: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const NurseriesManagement: React.FC = () => {
  const [nurseries, setNurseries] = useState<Nursery[]>([]);
  const [filteredNurseries, setFilteredNurseries] = useState<Nursery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNursery, setEditingNursery] = useState<Nursery | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'private',
    age_groups: [] as string[],
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
    transportation: false,
    meals: false,
    medical_care: false,
    rating: 0,
    is_active: true
  });

  useEffect(() => {
    loadNurseries();
  }, []);

  useEffect(() => {
    filterNurseries();
  }, [nurseries, searchTerm, selectedType]);

  const loadNurseries = async () => {
    try {
      const { data, error } = await supabase
        .from('nurseries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNurseries(data || []);
    } catch (error) {
      console.error('Error loading nurseries:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الحضانات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterNurseries = () => {
    let filtered = [...nurseries];

    if (searchTerm) {
      filtered = filtered.filter(nursery =>
        nursery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nursery.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nursery.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(nursery => nursery.type === selectedType);
    }

    setFilteredNurseries(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingNursery) {
        const { error } = await supabase
          .from('nurseries')
          .update(formData)
          .eq('id', editingNursery.id);

        if (error) throw error;
        
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث الحضانة بنجاح'
        });
      } else {
        const { error } = await supabase
          .from('nurseries')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة الحضانة بنجاح'
        });
      }

      setIsDialogOpen(false);
      setEditingNursery(null);
      resetForm();
      loadNurseries();
    } catch (error) {
      console.error('Error saving nursery:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الحضانة',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (nursery: Nursery) => {
    setEditingNursery(nursery);
    setFormData({
      name: nursery.name,
      type: nursery.type,
      age_groups: nursery.age_groups || [],
      address: nursery.address || '',
      phone: nursery.phone || '',
      email: nursery.email || '',
      website: nursery.website || '',
      description: nursery.description || '',
      image_url: nursery.image_url || '',
      logo_url: nursery.logo_url || '',
      established_year: nursery.established_year || new Date().getFullYear(),
      capacity: nursery.capacity || 0,
      fees_range: nursery.fees_range || '',
      operating_hours: nursery.operating_hours || '',
      languages: nursery.languages || [],
      facilities: nursery.facilities || [],
      transportation: nursery.transportation,
      meals: nursery.meals,
      medical_care: nursery.medical_care,
      rating: nursery.rating,
      is_active: nursery.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nurseries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الحضانة بنجاح'
      });
      
      loadNurseries();
    } catch (error) {
      console.error('Error deleting nursery:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الحضانة',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('nurseries')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الحضانة`
      });
      
      loadNurseries();
    } catch (error) {
      console.error('Error toggling nursery status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الحضانة',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'private',
      age_groups: [],
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
      transportation: false,
      meals: false,
      medical_care: false,
      rating: 0,
      is_active: true
    });
  };

  const openAddDialog = () => {
    setEditingNursery(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      private: 'خاصة',
      government: 'حكومية',
      international: 'دولية',
      community: 'مجتمعية'
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
          <h1 className="text-3xl font-bold">إدارة الحضانات</h1>
          <p className="text-muted-foreground">إدارة الحضانات ومراكز رعاية الأطفال</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة حضانة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNursery ? 'تعديل الحضانة' : 'إضافة حضانة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {editingNursery ? 'قم بتعديل بيانات الحضانة' : 'أدخل بيانات الحضانة الجديدة'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم الحضانة *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="مثال: حضانة النور"
                  />
                </div>
                <div>
                  <Label htmlFor="type">نوع الحضانة *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحضانة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">خاصة</SelectItem>
                      <SelectItem value="government">حكومية</SelectItem>
                      <SelectItem value="international">دولية</SelectItem>
                      <SelectItem value="community">مجتمعية</SelectItem>
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
                    placeholder="عنوان الحضانة"
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
                  placeholder="وصف الحضانة"
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
                  placeholder="مثال: 2000 - 5000 جنيه"
                />
              </div>

              <div>
                <Label htmlFor="operating_hours">ساعات العمل</Label>
                <Input
                  id="operating_hours"
                  value={formData.operating_hours}
                  onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                  placeholder="مثال: 7:00 ص - 5:00 م"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">الخدمات والمرافق</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      id="meals"
                      checked={formData.meals}
                      onCheckedChange={(checked) => setFormData({ ...formData, meals: checked })}
                    />
                    <Label htmlFor="meals">وجبات</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="medical_care"
                      checked={formData.medical_care}
                      onCheckedChange={(checked) => setFormData({ ...formData, medical_care: checked })}
                    />
                    <Label htmlFor="medical_care">رعاية طبية</Label>
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
                  {editingNursery ? 'تحديث' : 'إضافة'}
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
          <h3 className="text-lg font-semibold text-gray-900">فلترة الحضانات</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث عن حضانة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">نوع الحضانة</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الحضانة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="private">خاصة</SelectItem>
                <SelectItem value="government">حكومية</SelectItem>
                <SelectItem value="international">دولية</SelectItem>
                <SelectItem value="community">مجتمعية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">النتائج</label>
            <div className="bg-gray-50 rounded-md p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredNurseries.length}</div>
              <div className="text-sm text-gray-600">حضانة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Nurseries Table */}
      <Card>
        <CardHeader>
          <CardTitle>الحضانات ({filteredNurseries.length})</CardTitle>
          <CardDescription>قائمة بجميع الحضانات في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحضانة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>السعة</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNurseries.map((nursery) => (
                <TableRow key={nursery.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {nursery.logo_url ? (
                        <img
                          src={nursery.logo_url}
                          alt={nursery.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <Baby className="h-5 w-5 text-pink-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{nursery.name}</div>
                        <div className="text-sm text-muted-foreground">{nursery.operating_hours}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTypeLabel(nursery.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{nursery.address || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{nursery.capacity || 0}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{nursery.rating}</span>
                      <span className="text-xs text-muted-foreground">/5</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={nursery.is_active ? 'default' : 'secondary'}>
                      {nursery.is_active ? 'فعال' : 'غير فعال'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(nursery.id, nursery.is_active)}
                      >
                        {nursery.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(nursery)}
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
                              هل أنت متأكد من حذف الحضانة "{nursery.name}"؟ 
                              هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(nursery.id)}>
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

export default NurseriesManagement;
