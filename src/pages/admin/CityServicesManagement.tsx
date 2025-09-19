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
import { CreditCard, Building2, Users, Calendar, Mail, Plus, Edit, Trash2, Star, MapPin, Phone, Mail as MailIcon, Globe, Clock, DollarSign, ExternalLink, Baby } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ATM {
  id: string;
  name: string;
  bank_name: string;
  address?: string;
  phone?: string;
  services?: string[];
  operating_hours?: string;
  accessibility_features?: string[];
  languages?: string[];
  fees?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Bank {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  operating_hours?: string;
  services?: string[];
  languages?: string[];
  atm_available: boolean;
  parking_available: boolean;
  wheelchair_accessible: boolean;
  online_banking: boolean;
  mobile_banking: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface YouthClub {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  capacity?: number;
  operating_hours?: string;
  age_groups?: string[];
  activities?: string[];
  facilities?: string[];
  membership_required: boolean;
  membership_fee?: number;
  free_activities: boolean;
  languages?: string[];
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  venue?: string;
  address?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  organizer?: string;
  organizer_phone?: string;
  organizer_email?: string;
  image_url?: string;
  ticket_price?: number;
  is_free: boolean;
  age_restriction?: string;
  capacity?: number;
  registration_required: boolean;
  registration_deadline?: string;
  languages?: string[];
  tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PostOffice {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  image_url?: string;
  established_year?: number;
  operating_hours?: string;
  services?: string[];
  languages?: string[];
  parking_available: boolean;
  wheelchair_accessible: boolean;
  atm_available: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ChildrenService {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  phone2?: string;
  whatsapp?: string;
  facebook_url?: string;
  google_maps_url?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CityServicesManagement = () => {
  const [activeTab, setActiveTab] = useState('atms');
  const [atms, setAtms] = useState<ATM[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [youthClubs, setYouthClubs] = useState<YouthClub[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [childrenServices, setChildrenServices] = useState<ChildrenService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'atms':
          const { data: atmsData } = await supabase
            .from('atms')
            .select('*')
            .order('created_at', { ascending: false });
          setAtms(atmsData || []);
          break;
        case 'banks':
          const { data: banksData } = await supabase
            .from('banks')
            .select('*')
            .order('created_at', { ascending: false });
          setBanks(banksData || []);
          break;
        case 'youth-clubs':
          const { data: youthClubsData } = await supabase
            .from('youth_clubs')
            .select('*')
            .order('created_at', { ascending: false });
          setYouthClubs(youthClubsData || []);
          break;
        case 'events':
          const { data: eventsData } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });
          setEvents(eventsData || []);
          break;
        case 'post-offices':
          const { data: postOfficesData } = await supabase
            .from('post_offices')
            .select('*')
            .order('created_at', { ascending: false });
          setPostOffices(postOfficesData || []);
          break;
        case 'children-services':
          const { data: childrenServicesData } = await supabase
            .from('children_services')
            .select('*')
            .order('created_at', { ascending: false });
          setChildrenServices(childrenServicesData || []);
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
    
    // قيم افتراضية حسب نوع التبويب
    const defaultData = {
      atms: { 
        name: '', 
        bank_name: '', 
        address: '', 
        phone: '', 
        services: [], 
        operating_hours: '', 
        accessibility_features: [], 
        languages: [], 
        fees: '', 
        is_active: true 
      },
      banks: { 
        name: '', 
        type: '', 
        address: '', 
        phone: '', 
        email: '', 
        website: '', 
        services: [], 
        operating_hours: '', 
        is_active: true 
      },
      'youth-clubs': { 
        name: '', 
        type: '', 
        address: '', 
        phone: '', 
        email: '', 
        activities: [], 
        age_groups: [], 
        membership_fee: '', 
        is_active: true 
      },
      events: { 
        title: '', 
        description: '', 
        event_date: '', 
        event_time: '', 
        location: '', 
        organizer: '', 
        ticket_price: '', 
        is_active: true 
      },
      'post-offices': { 
        name: '', 
        address: '', 
        phone: '', 
        email: '', 
        services: [], 
        operating_hours: '', 
        is_active: true 
      },
      'children-services': { 
        name: '', 
        type: '', 
        address: '', 
        phone: '', 
        phone2: '', 
        whatsapp: '', 
        facebook_url: '', 
        google_maps_url: '', 
        website: '', 
        description: '', 
        image_url: '', 
        logo_url: '', 
        is_active: true 
      }
    };
    
    setFormData(defaultData[activeTab as keyof typeof defaultData] || {});
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

      // Validate required fields
      if (activeTab === 'banks' && (!data.name || !data.address)) {
        toast({
          title: 'خطأ',
          description: 'يرجى ملء جميع الحقول المطلوبة (اسم البنك والعنوان)',
          variant: 'destructive',
        });
        return;
      }

      if (activeTab === 'atms' && (!data.name || !data.address)) {
        toast({
          title: 'خطأ',
          description: 'يرجى ملء جميع الحقول المطلوبة (اسم الصراف والعنوان)',
          variant: 'destructive',
        });
        return;
      }

      if (activeTab === 'youth-clubs' && (!data.name || !data.address || !data.type)) {
        toast({
          title: 'خطأ',
          description: 'يرجى ملء جميع الحقول المطلوبة (اسم النادي، نوع النادي، والعنوان)',
          variant: 'destructive',
        });
        return;
      }

      if (activeTab === 'events' && !data.title) {
        toast({
          title: 'خطأ',
          description: 'يرجى ملء عنوان الفعالية',
          variant: 'destructive',
        });
        return;
      }

      if (activeTab === 'post-offices' && (!data.name || !data.address)) {
        toast({
          title: 'خطأ',
          description: 'يرجى ملء جميع الحقول المطلوبة (اسم مكتب البريد والعنوان)',
          variant: 'destructive',
        });
        return;
      }

      if (activeTab === 'children-services' && (!data.name || !data.type || !data.address)) {
        toast({
          title: 'خطأ',
          description: 'يرجى ملء جميع الحقول المطلوبة (اسم الخدمة، نوع الخدمة، والعنوان)',
          variant: 'destructive',
        });
        return;
      }

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
      case 'atms': return 'atms';
      case 'banks': return 'banks';
      case 'youth-clubs': return 'youth_clubs';
      case 'events': return 'events';
      case 'post-offices': return 'post_offices';
      case 'children-services': return 'children_services';
      default: return 'atms';
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
          <h1 className="text-3xl font-bold text-gray-900">إدارة خدمات المدينة</h1>
          <p className="text-gray-600 mt-2">إدارة أجهزة الصراف الآلي، البنوك، النوادي، الفعاليات، ومكاتب البريد</p>
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
                {editingItem ? 'تعديل' : 'إضافة'} {activeTab === 'atms' ? 'جهاز صراف آلي' : activeTab === 'banks' ? 'بنك' : activeTab === 'youth-clubs' ? 'نادي شباب' : activeTab === 'children-services' ? 'خدمة أطفال' : activeTab === 'events' ? 'فعالية' : 'مكتب بريد'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'قم بتعديل البيانات أدناه' : 'أدخل البيانات المطلوبة أدناه'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {activeTab === 'atms' && (
                <>
                  <div>
                    <Label htmlFor="name">اسم البنك *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="مثل: البنك الأهلي المصري"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="مثل: شارع النيل، حدائق أكتوبر"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_name">اسم البنك</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name || ''}
                      onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                      placeholder="مثل: البنك الأهلي المصري"
                    />
                  </div>
                  <div>
                    <Label htmlFor="services">الخدمات المتاحة</Label>
                    <Input
                      id="services"
                      value={formData.services || ''}
                      onChange={(e) => setFormData({...formData, services: e.target.value})}
                      placeholder="مثل: سحب نقدي، استعلام رصيد، تحويل"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operating_hours">ساعات العمل</Label>
                    <Input
                      id="operating_hours"
                      value={formData.operating_hours || ''}
                      onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                      placeholder="مثل: 24/7"
                    />
                  </div>
                  <div>
                    <Label htmlFor="google_maps_url">رابط Google Maps</Label>
                    <Input
                      id="google_maps_url"
                      value={formData.google_maps_url || ''}
                      onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'banks' && (
                <>
                  <div>
                    <Label htmlFor="name">اسم البنك *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="مثل: البنك الأهلي المصري"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="مثل: شارع النيل، حدائق أكتوبر"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="مثل: 01001234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="services">الخدمات المتاحة</Label>
                    <Input
                      id="services"
                      value={formData.services || ''}
                      onChange={(e) => setFormData({...formData, services: e.target.value})}
                      placeholder="مثل: حسابات جارية، قروض، استثمار"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operating_hours">ساعات العمل</Label>
                    <Input
                      id="operating_hours"
                      value={formData.operating_hours || ''}
                      onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                      placeholder="مثل: 8:00 AM - 4:00 PM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="google_maps_url">رابط Google Maps</Label>
                    <Input
                      id="google_maps_url"
                      value={formData.google_maps_url || ''}
                      onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'youth-clubs' && (
                <>
                  <div>
                    <Label htmlFor="name">اسم النادي *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="مثل: نادي شباب حدائق أكتوبر"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">نوع النادي *</Label>
                    <Select
                      value={formData.type || ''}
                      onValueChange={(value) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع النادي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sports_club">نادي رياضي</SelectItem>
                        <SelectItem value="cultural_center">مركز ثقافي</SelectItem>
                        <SelectItem value="youth_center">مركز شباب</SelectItem>
                        <SelectItem value="community_center">مركز مجتمعي</SelectItem>
                        <SelectItem value="recreation_center">مركز ترفيهي</SelectItem>
                        <SelectItem value="art_center">مركز فني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="مثل: شارع الشباب، حدائق أكتوبر"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="مثل: 01001234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activities">الأنشطة المتاحة</Label>
                    <Input
                      id="activities"
                      value={formData.activities || ''}
                      onChange={(e) => setFormData({...formData, activities: e.target.value})}
                      placeholder="مثل: كرة قدم، تنس، سباحة، أنشطة ثقافية"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operating_hours">ساعات العمل</Label>
                    <Input
                      id="operating_hours"
                      value={formData.operating_hours || ''}
                      onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                      placeholder="مثل: 6:00 AM - 10:00 PM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="google_maps_url">رابط Google Maps</Label>
                    <Input
                      id="google_maps_url"
                      value={formData.google_maps_url || ''}
                      onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'events' && (
                <>
                  <div>
                    <Label htmlFor="title">عنوان الفعالية *</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="مثل: مهرجان الربيع الثقافي"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_type">نوع الفعالية</Label>
                    <Input
                      id="event_type"
                      value={formData.event_type || ''}
                      onChange={(e) => setFormData({...formData, event_type: e.target.value})}
                      placeholder="مثل: ثقافي، رياضي، ترفيهي"
                    />
                  </div>
                  <div>
                    <Label htmlFor="venue">مكان الفعالية</Label>
                    <Input
                      id="venue"
                      value={formData.venue || ''}
                      onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      placeholder="مثل: قاعة المؤتمرات، حديقة المدينة"
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_date">تاريخ البداية</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date || ''}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ticket_price">سعر التذكرة (جنيه)</Label>
                    <Input
                      id="ticket_price"
                      type="number"
                      value={formData.ticket_price || ''}
                      onChange={(e) => setFormData({...formData, ticket_price: parseFloat(e.target.value) || 0})}
                      placeholder="مثل: 50"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active || false}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="is_active">فعال</Label>
                  </div>
                  <div>
                    <Label htmlFor="google_maps_url">رابط Google Maps</Label>
                    <Input
                      id="google_maps_url"
                      value={formData.google_maps_url || ''}
                      onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'post-offices' && (
                <>
                  <div>
                    <Label htmlFor="name">اسم مكتب البريد *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="مثل: مكتب بريد حدائق أكتوبر"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="مثل: شارع البريد، حدائق أكتوبر"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="مثل: 01001234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="services">الخدمات المتاحة</Label>
                    <Input
                      id="services"
                      value={formData.services || ''}
                      onChange={(e) => setFormData({...formData, services: e.target.value})}
                      placeholder="مثل: إرسال بريد، حوالات، فواتير"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operating_hours">ساعات العمل</Label>
                    <Input
                      id="operating_hours"
                      value={formData.operating_hours || ''}
                      onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                      placeholder="مثل: 8:00 AM - 4:00 PM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="google_maps_url">رابط Google Maps</Label>
                    <Input
                      id="google_maps_url"
                      value={formData.google_maps_url || ''}
                      onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'children-services' && (
                <>
                  <div>
                    <Label htmlFor="name">اسم الخدمة *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="مثل: ملاهي المدينة الترفيهية"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">نوع الخدمة *</Label>
                    <Select
                      value={formData.type || ''}
                      onValueChange={(value) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الخدمة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="playground">ملاهي</SelectItem>
                        <SelectItem value="kids_area">كيدز ايريا</SelectItem>
                        <SelectItem value="entertainment">أنشطة ترفيهية</SelectItem>
                        <SelectItem value="games">ألعاب</SelectItem>
                        <SelectItem value="art">فنون</SelectItem>
                        <SelectItem value="music">موسيقى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان *</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="مثل: شارع النيل، وسط المدينة"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف الرئيسي</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="مثل: 01001234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone2">رقم الهاتف الثانوي</Label>
                    <Input
                      id="phone2"
                      value={formData.phone2 || ''}
                      onChange={(e) => setFormData({...formData, phone2: e.target.value})}
                      placeholder="مثل: 01001234568"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">رقم الواتساب</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp || ''}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      placeholder="مثل: 01001234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook_url">رابط صفحة الفيسبوك</Label>
                    <Input
                      id="facebook_url"
                      value={formData.facebook_url || ''}
                      onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">رابط الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="google_maps_url">رابط Google Maps</Label>
                    <Input
                      id="google_maps_url"
                      value={formData.google_maps_url || ''}
                      onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">وصف الخدمة</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="وصف مفصل للخدمة والأنشطة المتاحة"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">رابط صورة المكان</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo_url">رابط شعار المكان</Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url || ''}
                      onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                      placeholder="https://example.com/logo.jpg"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active || false}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="is_active">نشط</Label>
                  </div>
                </>
              )}
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
        <TabsList className="grid w-full grid-cols-6 gap-1">
          <TabsTrigger value="atms" className="flex flex-col items-center space-y-1 px-1 py-2 text-xs">
            <CreditCard className="h-4 w-4" />
            <span>صراف</span>
          </TabsTrigger>
          <TabsTrigger value="banks" className="flex flex-col items-center space-y-1 px-1 py-2 text-xs">
            <Building2 className="h-4 w-4" />
            <span>بنوك</span>
          </TabsTrigger>
          <TabsTrigger value="youth-clubs" className="flex flex-col items-center space-y-1 px-1 py-2 text-xs">
            <Users className="h-4 w-4" />
            <span>نوادي</span>
          </TabsTrigger>
          <TabsTrigger value="children-services" className="flex flex-col items-center space-y-1 px-1 py-2 text-xs">
            <Baby className="h-4 w-4" />
            <span>أطفال</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex flex-col items-center space-y-1 px-1 py-2 text-xs">
            <Calendar className="h-4 w-4" />
            <span>فعاليات</span>
          </TabsTrigger>
          <TabsTrigger value="post-offices" className="flex flex-col items-center space-y-1 px-1 py-2 text-xs">
            <Mail className="h-4 w-4" />
            <span>بريد</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atms" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {atms.map((atm) => (
              <Card key={atm.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{atm.name}</CardTitle>
                        <CardDescription>{atm.bank_name}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Switch checked={atm.is_active} disabled />
                      <span className={atm.is_active ? 'text-green-600' : 'text-red-600'}>
                        {atm.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {atm.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{atm.address}</span>
                      </div>
                    )}
                    {atm.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{atm.phone}</span>
                      </div>
                    )}
                    {atm.operating_hours && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{atm.operating_hours}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    {atm.google_maps_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(atm.google_maps_url, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        الموقع
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(atm)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(atm.id, 'atms')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="banks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banks.map((bank) => (
              <Card key={bank.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-6 w-6 text-green-600" />
                      <div>
                        <CardTitle className="text-lg">{bank.name}</CardTitle>
                        <CardDescription>{bank.type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(bank.rating)}
                      <span className="text-sm text-gray-500">({bank.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bank.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{bank.address}</span>
                      </div>
                    )}
                    {bank.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{bank.phone}</span>
                      </div>
                    )}
                    {bank.operating_hours && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{bank.operating_hours}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    {bank.google_maps_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(bank.google_maps_url, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        الموقع
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(bank)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(bank.id, 'banks')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="youth-clubs" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {youthClubs.map((club) => (
              <Card key={club.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-6 w-6 text-purple-600" />
                      <div>
                        <CardTitle className="text-lg">{club.name}</CardTitle>
                        <CardDescription>{club.type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(club.rating)}
                      <span className="text-sm text-gray-500">({club.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {club.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{club.address}</span>
                      </div>
                    )}
                    {club.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{club.phone}</span>
                      </div>
                    )}
                    {club.operating_hours && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{club.operating_hours}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    {club.google_maps_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(club.google_maps_url, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        الموقع
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(club)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(club.id, 'youth_clubs')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="children-services" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {childrenServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Baby className="h-6 w-6 text-pink-600" />
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>
                          {service.type === 'playground' ? 'ملاهي' :
                           service.type === 'kids_area' ? 'كيدز ايريا' :
                           service.type === 'entertainment' ? 'أنشطة ترفيهية' :
                           service.type === 'games' ? 'ألعاب' :
                           service.type === 'art' ? 'فنون' :
                           service.type === 'music' ? 'موسيقى' : service.type}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Switch checked={service.is_active} disabled />
                      <span className={service.is_active ? 'text-green-600' : 'text-red-600'}>
                        {service.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {service.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{service.address}</span>
                      </div>
                    )}
                    {service.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{service.phone}</span>
                      </div>
                    )}
                    {service.whatsapp && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>💬</span>
                        <span>{service.whatsapp}</span>
                      </div>
                    )}
                    {service.description && (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {service.description}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    {service.google_maps_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(service.google_maps_url, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        الموقع
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(service.id, 'children_services')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-6 w-6 text-orange-600" />
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <CardDescription>{event.event_type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Switch checked={event.is_active} disabled />
                      <span className={event.is_active ? 'text-green-600' : 'text-red-600'}>
                        {event.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.venue && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                    {event.start_date && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(event.start_date).toLocaleDateString('ar-EG')}</span>
                      </div>
                    )}
                    {event.ticket_price && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{event.ticket_price} جنيه</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    {event.google_maps_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(event.google_maps_url, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        الموقع
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(event.id, 'events')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="post-offices" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postOffices.map((office) => (
              <Card key={office.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-6 w-6 text-red-600" />
                      <div>
                        <CardTitle className="text-lg">{office.name}</CardTitle>
                        <CardDescription>مكتب بريد</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(office.rating)}
                      <span className="text-sm text-gray-500">({office.rating})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {office.address && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{office.address}</span>
                      </div>
                    )}
                    {office.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{office.phone}</span>
                      </div>
                    )}
                    {office.operating_hours && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{office.operating_hours}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    {office.google_maps_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(office.google_maps_url, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        الموقع
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(office)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(office.id, 'post_offices')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CityServicesManagement;
