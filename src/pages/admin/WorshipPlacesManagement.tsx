import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, MapPin, Phone, Globe, Users, Clock, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import MultiImageUpload from '@/components/MultiImageUpload';

interface WorshipPlaceData {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  image_url: string;
  logo_url: string;
  prayer_times: any;
  services: any;
  capacity: number;
  is_accessible: boolean;
  events: Array<{
    id: string;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    image_url: string;
  }>;
  worship_services: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
}

const WorshipPlacesManagement = () => {
  const [worshipPlaces, setWorshipPlaces] = useState<WorshipPlaceData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorshipPlace, setEditingWorshipPlace] = useState<WorshipPlaceData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newWorshipPlace, setNewWorshipPlace] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    image_url: '',
    logo_url: '',
    prayer_times: {
      الفجر: '',
      الظهر: '',
      العصر: '',
      المغرب: '',
      العشاء: ''
    },
    services: [],
    events: [],
    worship_services: [],
    capacity: 0,
    is_accessible: true
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    image_url: ''
  });

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    icon: ''
  });

  const worshipTypes = [
    { value: 'مسجد', label: 'مسجد' },
    { value: 'كنيسة', label: 'كنيسة' },
    { value: 'معبد', label: 'معبد' }
  ];

  const serviceIcons = [
    'BookOpen', 'GraduationCap', 'Utensils', 'Heart', 'Users', 'Clock', 'MapPin', 'Phone'
  ];

  useEffect(() => {
    loadWorshipPlaces();
  }, []);

  const loadWorshipPlaces = async () => {
    try {
      setLoading(true);
      const { data: worshipPlacesData, error: worshipError } = await supabase
        .from('worship_places')
        .select('*')
        .order('created_at', { ascending: false });

      if (worshipError) throw worshipError;

      // Load events and services for each worship place
      const worshipPlacesWithDetails = await Promise.all(
        worshipPlacesData.map(async (worshipPlace) => {
          const { data: events } = await supabase
            .from('worship_place_events')
            .select('*')
            .eq('worship_place_id', worshipPlace.id);

          const { data: services } = await supabase
            .from('worship_place_services')
            .select('*')
            .eq('worship_place_id', worshipPlace.id);

          return {
            ...worshipPlace,
            events: events || [],
            worship_services: services || []
          };
        })
      );

      setWorshipPlaces(worshipPlacesWithDetails);
    } catch (error) {
      console.error('Error loading worship places:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل دور العبادة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorshipPlace = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('worship_places')
        .insert([{
          name: newWorshipPlace.name,
          type: newWorshipPlace.type,
          address: newWorshipPlace.address,
          phone: newWorshipPlace.phone,
          website: newWorshipPlace.website,
          description: newWorshipPlace.description,
          image_url: newWorshipPlace.image_url,
          logo_url: newWorshipPlace.logo_url,
          prayer_times: newWorshipPlace.prayer_times,
          services: newWorshipPlace.services,
          capacity: newWorshipPlace.capacity,
          is_accessible: newWorshipPlace.is_accessible
        }])
        .select()
        .single();

      if (error) throw error;

      // Add events
      if (newWorshipPlace.events.length > 0) {
        const eventsToInsert = newWorshipPlace.events.map((event: any) => ({
          worship_place_id: data.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          event_time: event.event_time,
          image_url: event.image_url
        }));

        await supabase
          .from('worship_place_events')
          .insert(eventsToInsert);
      }

      // Add services
      if (newWorshipPlace.worship_services.length > 0) {
        const servicesToInsert = newWorshipPlace.worship_services.map((service: any) => ({
          worship_place_id: data.id,
          name: service.name,
          description: service.description,
          icon: service.icon
        }));

        await supabase
          .from('worship_place_services')
          .insert(servicesToInsert);
      }

      toast({
        title: "نجح",
        description: "تم إضافة دار العبادة بنجاح",
      });

      setIsAddDialogOpen(false);
      resetForm();
      loadWorshipPlaces();
    } catch (error) {
      console.error('Error adding worship place:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة دار العبادة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorshipPlace = async () => {
    if (!editingWorshipPlace) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('worship_places')
        .update({
          name: editingWorshipPlace.name,
          type: editingWorshipPlace.type,
          address: editingWorshipPlace.address,
          phone: editingWorshipPlace.phone,
          website: editingWorshipPlace.website,
          description: editingWorshipPlace.description,
          image_url: editingWorshipPlace.image_url,
          logo_url: editingWorshipPlace.logo_url,
          prayer_times: editingWorshipPlace.prayer_times,
          services: editingWorshipPlace.services,
          capacity: editingWorshipPlace.capacity,
          is_accessible: editingWorshipPlace.is_accessible
        })
        .eq('id', editingWorshipPlace.id);

      if (error) throw error;

      // Update events
      await supabase
        .from('worship_place_events')
        .delete()
        .eq('worship_place_id', editingWorshipPlace.id);

      if (editingWorshipPlace.events.length > 0) {
        const eventsToInsert = editingWorshipPlace.events.map((event: any) => ({
          worship_place_id: editingWorshipPlace.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          event_time: event.event_time,
          image_url: event.image_url
        }));

        await supabase
          .from('worship_place_events')
          .insert(eventsToInsert);
      }

      // Update services
      await supabase
        .from('worship_place_services')
        .delete()
        .eq('worship_place_id', editingWorshipPlace.id);

      if (editingWorshipPlace.worship_services.length > 0) {
        const servicesToInsert = editingWorshipPlace.worship_services.map((service: any) => ({
          worship_place_id: editingWorshipPlace.id,
          name: service.name,
          description: service.description,
          icon: service.icon
        }));

        await supabase
          .from('worship_place_services')
          .insert(servicesToInsert);
      }

      toast({
        title: "نجح",
        description: "تم تحديث دار العبادة بنجاح",
      });

      setIsEditDialogOpen(false);
      setEditingWorshipPlace(null);
      loadWorshipPlaces();
    } catch (error) {
      console.error('Error updating worship place:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث دار العبادة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorshipPlace = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف دار العبادة؟')) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('worship_places')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "نجح",
        description: "تم حذف دار العبادة بنجاح",
      });

      loadWorshipPlaces();
    } catch (error) {
      console.error('Error deleting worship place:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف دار العبادة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewWorshipPlace({
      name: '',
      type: '',
      address: '',
      phone: '',
      website: '',
      description: '',
      image_url: '',
      logo_url: '',
      prayer_times: {
        الفجر: '',
        الظهر: '',
        العصر: '',
        المغرب: '',
        العشاء: ''
      },
      services: [],
      events: [],
      worship_services: [],
      capacity: 0,
      is_accessible: true
    });
    setNewEvent({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      image_url: ''
    });
    setNewService({
      name: '',
      description: '',
      icon: ''
    });
  };

  const addEvent = () => {
    if (newEvent.title && newEvent.event_date) {
      setNewWorshipPlace(prev => ({
        ...prev,
        events: [...prev.events, { ...newEvent, id: Date.now().toString() }]
      }));
      setNewEvent({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        image_url: ''
      });
    }
  };

  const addService = () => {
    if (newService.name && newService.icon) {
      setNewWorshipPlace(prev => ({
        ...prev,
        worship_services: [...prev.worship_services, { ...newService, id: Date.now().toString() }]
      }));
      setNewService({
        name: '',
        description: '',
        icon: ''
      });
    }
  };

  const removeEvent = (index: number) => {
    setNewWorshipPlace(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index)
    }));
  };

  const removeService = (index: number) => {
    setNewWorshipPlace(prev => ({
      ...prev,
      worship_services: prev.worship_services.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة دور العبادة</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              إضافة دار عبادة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة دار عبادة جديدة</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                <TabsTrigger value="prayer">أوقات الصلاة</TabsTrigger>
                <TabsTrigger value="events">الفعاليات</TabsTrigger>
                <TabsTrigger value="services">الخدمات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">اسم دار العبادة *</Label>
                    <Input
                      id="name"
                      value={newWorshipPlace.name}
                      onChange={(e) => setNewWorshipPlace(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="مثال: مسجد النور"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">نوع دار العبادة *</Label>
                    <Select value={newWorshipPlace.type} onValueChange={(value) => setNewWorshipPlace(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        {worshipTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={newWorshipPlace.address}
                      onChange={(e) => setNewWorshipPlace(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="العنوان الكامل"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={newWorshipPlace.phone}
                      onChange={(e) => setNewWorshipPlace(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="01001234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      value={newWorshipPlace.website}
                      onChange={(e) => setNewWorshipPlace(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">السعة</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newWorshipPlace.capacity}
                      onChange={(e) => setNewWorshipPlace(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      placeholder="500"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={newWorshipPlace.description}
                    onChange={(e) => setNewWorshipPlace(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف دار العبادة..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>الصورة الرئيسية</Label>
                    <ImageUpload
                      onChange={(image) => setNewWorshipPlace(prev => ({ ...prev, image_url: image }))}
                      value={newWorshipPlace.image_url}
                    />
                  </div>
                  <div>
                    <Label>الشعار</Label>
                    <ImageUpload
                      onChange={(image) => setNewWorshipPlace(prev => ({ ...prev, logo_url: image }))}
                      value={newWorshipPlace.logo_url}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_accessible"
                    checked={newWorshipPlace.is_accessible}
                    onChange={(e) => setNewWorshipPlace(prev => ({ ...prev, is_accessible: e.target.checked }))}
                  />
                  <Label htmlFor="is_accessible">إمكانية الوصول للمعاقين</Label>
                </div>
              </TabsContent>

              <TabsContent value="prayer" className="space-y-4">
                <h3 className="text-lg font-semibold">أوقات الصلاة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(newWorshipPlace.prayer_times).map(([prayer, time]) => (
                    <div key={prayer}>
                      <Label htmlFor={prayer}>{prayer}</Label>
                      <Input
                        id={prayer}
                        value={time}
                        onChange={(e) => setNewWorshipPlace(prev => ({
                          ...prev,
                          prayer_times: { ...prev.prayer_times, [prayer]: e.target.value }
                        }))}
                        placeholder="5:30"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <h3 className="text-lg font-semibold">الفعاليات</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_title">عنوان الفعالية</Label>
                      <Input
                        id="event_title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="درس ديني أسبوعي"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event_date">تاريخ الفعالية</Label>
                      <Input
                        id="event_date"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                        placeholder="كل جمعة"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event_time">وقت الفعالية</Label>
                      <Input
                        id="event_time"
                        value={newEvent.event_time}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, event_time: e.target.value }))}
                        placeholder="8:00 مساءً"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event_image">صورة الفعالية</Label>
                      <ImageUpload
                        onChange={(image) => setNewEvent(prev => ({ ...prev, image_url: image }))}
                        value={newEvent.image_url}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="event_description">وصف الفعالية</Label>
                    <Textarea
                      id="event_description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="وصف الفعالية..."
                      rows={2}
                    />
                  </div>
                  <Button onClick={addEvent} type="button">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة فعالية
                  </Button>
                </div>

                {newWorshipPlace.events && newWorshipPlace.events.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">الفعاليات المضافة:</h4>
                    {newWorshipPlace.events.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-600">{event.event_date} - {event.event_time}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEvent(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <h3 className="text-lg font-semibold">الخدمات</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service_name">اسم الخدمة</Label>
                      <Input
                        id="service_name"
                        value={newService.name}
                        onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="تعليم القرآن"
                      />
                    </div>
                    <div>
                      <Label htmlFor="service_icon">أيقونة الخدمة</Label>
                      <Select value={newService.icon} onValueChange={(value) => setNewService(prev => ({ ...prev, icon: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الأيقونة" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceIcons.map(icon => (
                            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="service_description">وصف الخدمة</Label>
                    <Textarea
                      id="service_description"
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="وصف الخدمة..."
                      rows={2}
                    />
                  </div>
                  <Button onClick={addService} type="button">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة خدمة
                  </Button>
                </div>

                {newWorshipPlace.worship_services && newWorshipPlace.worship_services.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">الخدمات المضافة:</h4>
                    {newWorshipPlace.worship_services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeService(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddWorshipPlace} disabled={loading}>
                {loading ? 'جاري الإضافة...' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل دار العبادة</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                <TabsTrigger value="prayer">أوقات الصلاة</TabsTrigger>
                <TabsTrigger value="events">الفعاليات</TabsTrigger>
                <TabsTrigger value="services">الخدمات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_name">اسم دار العبادة *</Label>
                    <Input
                      id="edit_name"
                      value={editingWorshipPlace?.name || ''}
                      onChange={(e) => setEditingWorshipPlace(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="مثال: مسجد النور"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_type">نوع دار العبادة *</Label>
                    <Select 
                      value={editingWorshipPlace?.type || ''} 
                      onValueChange={(value) => setEditingWorshipPlace(prev => prev ? { ...prev, type: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        {worshipTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_address">العنوان</Label>
                    <Input
                      id="edit_address"
                      value={editingWorshipPlace?.address || ''}
                      onChange={(e) => setEditingWorshipPlace(prev => prev ? { ...prev, address: e.target.value } : null)}
                      placeholder="العنوان الكامل"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_phone">رقم الهاتف</Label>
                    <Input
                      id="edit_phone"
                      value={editingWorshipPlace?.phone || ''}
                      onChange={(e) => setEditingWorshipPlace(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      placeholder="01001234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_website">الموقع الإلكتروني</Label>
                    <Input
                      id="edit_website"
                      value={editingWorshipPlace?.website || ''}
                      onChange={(e) => setEditingWorshipPlace(prev => prev ? { ...prev, website: e.target.value } : null)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_capacity">السعة</Label>
                    <Input
                      id="edit_capacity"
                      type="number"
                      value={editingWorshipPlace?.capacity || 0}
                      onChange={(e) => setEditingWorshipPlace(prev => prev ? { ...prev, capacity: parseInt(e.target.value) || 0 } : null)}
                      placeholder="500"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit_description">الوصف</Label>
                  <Textarea
                    id="edit_description"
                    value={editingWorshipPlace?.description || ''}
                    onChange={(e) => setEditingWorshipPlace(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="وصف دار العبادة..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>الصورة الرئيسية</Label>
                    <ImageUpload
                      onChange={(image) => setEditingWorshipPlace(prev => prev ? { ...prev, image_url: image } : null)}
                      value={editingWorshipPlace?.image_url || ''}
                    />
                  </div>
                  <div>
                    <Label>الشعار</Label>
                    <ImageUpload
                      onChange={(image) => setEditingWorshipPlace(prev => prev ? { ...prev, logo_url: image } : null)}
                      value={editingWorshipPlace?.logo_url || ''}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_accessible"
                    checked={editingWorshipPlace?.is_accessible || false}
                    onChange={(e) => setEditingWorshipPlace(prev => prev ? { ...prev, is_accessible: e.target.checked } : null)}
                  />
                  <Label htmlFor="edit_is_accessible">إمكانية الوصول للمعاقين</Label>
                </div>
              </TabsContent>

              <TabsContent value="prayer" className="space-y-4">
                <h3 className="text-lg font-semibold">أوقات الصلاة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingWorshipPlace?.prayer_times && Object.entries(editingWorshipPlace.prayer_times).map(([prayer, time]) => (
                    <div key={prayer}>
                      <Label htmlFor={`edit_${prayer}`}>{prayer}</Label>
                      <Input
                        id={`edit_${prayer}`}
                        value={time as string}
                        onChange={(e) => setEditingWorshipPlace(prev => prev ? ({
                          ...prev,
                          prayer_times: { ...prev.prayer_times, [prayer]: e.target.value }
                        }) : null)}
                        placeholder="5:30"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <h3 className="text-lg font-semibold">الفعاليات</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_event_title">عنوان الفعالية</Label>
                      <Input
                        id="edit_event_title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="درس ديني أسبوعي"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_event_date">تاريخ الفعالية</Label>
                      <Input
                        id="edit_event_date"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                        placeholder="كل جمعة"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_event_time">وقت الفعالية</Label>
                      <Input
                        id="edit_event_time"
                        value={newEvent.event_time}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, event_time: e.target.value }))}
                        placeholder="8:00 مساءً"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_event_image">صورة الفعالية</Label>
                      <ImageUpload
                        onChange={(image) => setNewEvent(prev => ({ ...prev, image_url: image }))}
                        value={newEvent.image_url}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit_event_description">وصف الفعالية</Label>
                    <Textarea
                      id="edit_event_description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="وصف الفعالية..."
                      rows={2}
                    />
                  </div>
                  <Button onClick={addEvent} type="button">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة فعالية
                  </Button>
                </div>

                {editingWorshipPlace?.events && editingWorshipPlace.events.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">الفعاليات المضافة:</h4>
                    {editingWorshipPlace.events.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-600">{event.event_date} - {event.event_time}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const updatedEvents = editingWorshipPlace.events.filter((_, i) => i !== index);
                            setEditingWorshipPlace(prev => prev ? { ...prev, events: updatedEvents } : null);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <h3 className="text-lg font-semibold">الخدمات</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_service_name">اسم الخدمة</Label>
                      <Input
                        id="edit_service_name"
                        value={newService.name}
                        onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="تعليم القرآن"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_service_icon">أيقونة الخدمة</Label>
                      <Select value={newService.icon} onValueChange={(value) => setNewService(prev => ({ ...prev, icon: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الأيقونة" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceIcons.map(icon => (
                            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit_service_description">وصف الخدمة</Label>
                    <Textarea
                      id="edit_service_description"
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="وصف الخدمة..."
                      rows={2}
                    />
                  </div>
                  <Button onClick={addService} type="button">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة خدمة
                  </Button>
                </div>

                {editingWorshipPlace?.worship_services && editingWorshipPlace.worship_services.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">الخدمات المضافة:</h4>
                    {editingWorshipPlace.worship_services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const updatedServices = editingWorshipPlace.worship_services.filter((_, i) => i !== index);
                            setEditingWorshipPlace(prev => prev ? { ...prev, worship_services: updatedServices } : null);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleUpdateWorshipPlace} disabled={loading}>
                {loading ? 'جاري التحديث...' : 'تحديث'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {worshipPlaces.map((worshipPlace) => (
          <Card key={worshipPlace.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={worshipPlace.image_url?.startsWith('data:') ? worshipPlace.image_url : (worshipPlace.image_url || '/placeholder.svg')}
                alt={worshipPlace.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary">{worshipPlace.type}</Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <img
                  src={worshipPlace.logo_url?.startsWith('data:') ? worshipPlace.logo_url : (worshipPlace.logo_url || '/placeholder.svg')}
                  alt="Logo"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <CardTitle className="text-lg">{worshipPlace.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-gray-600">
                {worshipPlace.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{worshipPlace.address}</span>
                  </div>
                )}
                {worshipPlace.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{worshipPlace.phone}</span>
                  </div>
                )}
                {worshipPlace.capacity > 0 && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>السعة: {worshipPlace.capacity}</span>
                  </div>
                )}
                {worshipPlace.is_accessible && (
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>إمكانية الوصول للمعاقين</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingWorshipPlace(worshipPlace);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  تعديل
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteWorshipPlace(worshipPlace.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {worshipPlaces.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">لا توجد دور عبادة مضافة بعد</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      )}
    </div>
  );
};

export default WorshipPlacesManagement;
