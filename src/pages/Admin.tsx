import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  published_at: string;
}

interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  description: string;
  type: string;
  available: boolean;
  order_priority: number;
  station_id?: string;
}

interface PoliceStation {
  id: string;
  name: string;
  area: string;
  address?: string;
  description?: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // News state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newNews, setNewNews] = useState({
    title: '',
    summary: '',
    content: '',
    category: ''
  });

  // Emergency contacts state
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [newContact, setNewContact] = useState({
    title: '',
    number: '',
    description: '',
    type: '',
    available: true,
    order_priority: 0,
    station_id: ''
  });

  // Police stations state
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [editingStation, setEditingStation] = useState<PoliceStation | null>(null);
  const [newStation, setNewStation] = useState({
    name: '',
    area: '',
    address: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      checkAdminRole();
    } else {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchNews();
      fetchContacts();
      fetchStations();
    }
  }, [isAdmin]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setIsAdmin(true);
      } else {
        toast({
          title: "غير مخول",
          description: "ليس لديك صلاحيات الوصول لهذه الصفحة",
          variant: "destructive"
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('order_priority', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('police_stations')
        .select('*')
        .order('area', { ascending: true });

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const handleAddNews = async () => {
    try {
      const { error } = await supabase
        .from('news')
        .insert([newNews]);

      if (error) throw error;

      toast({
        title: "تم إضافة الخبر",
        description: "تم إضافة الخبر بنجاح"
      });

      setNewNews({ title: '', summary: '', content: '', category: '' });
      fetchNews();
    } catch (error) {
      console.error('Error adding news:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الخبر",
        variant: "destructive"
      });
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;

    try {
      const { error } = await supabase
        .from('news')
        .update({
          title: editingNews.title,
          summary: editingNews.summary,
          content: editingNews.content,
          category: editingNews.category
        })
        .eq('id', editingNews.id);

      if (error) throw error;

      toast({
        title: "تم تحديث الخبر",
        description: "تم تحديث الخبر بنجاح"
      });

      setEditingNews(null);
      fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الخبر",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم حذف الخبر",
        description: "تم حذف الخبر بنجاح"
      });

      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الخبر",
        variant: "destructive"
      });
    }
  };

  const handleAddContact = async () => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert([newContact]);

      if (error) throw error;

      toast({
        title: "تم إضافة الرقم",
        description: "تم إضافة رقم الطوارئ بنجاح"
      });

      setNewContact({
        title: '',
        number: '',
        description: '',
        type: '',
        available: true,
        order_priority: 0,
        station_id: ''
      });
      fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الرقم",
        variant: "destructive"
      });
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update({
          title: editingContact.title,
          number: editingContact.number,
          description: editingContact.description,
          type: editingContact.type,
          available: editingContact.available,
          order_priority: editingContact.order_priority,
          station_id: editingContact.station_id || null
        })
        .eq('id', editingContact.id);

      if (error) throw error;

      toast({
        title: "تم تحديث الرقم",
        description: "تم تحديث رقم الطوارئ بنجاح"
      });

      setEditingContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الرقم",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرقم؟')) return;

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم حذف الرقم",
        description: "تم حذف رقم الطوارئ بنجاح"
      });

      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الرقم",
        variant: "destructive"
      });
    }
  };

  const handleAddStation = async () => {
    try {
      const { error } = await supabase
        .from('police_stations')
        .insert([newStation]);

      if (error) throw error;

      toast({
        title: "تم إضافة المركز",
        description: "تم إضافة مركز الشرطة بنجاح"
      });

      setNewStation({
        name: '',
        area: '',
        address: '',
        description: ''
      });
      fetchStations();
    } catch (error) {
      console.error('Error adding station:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المركز",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStation = async () => {
    if (!editingStation) return;

    try {
      const { error } = await supabase
        .from('police_stations')
        .update({
          name: editingStation.name,
          area: editingStation.area,
          address: editingStation.address,
          description: editingStation.description
        })
        .eq('id', editingStation.id);

      if (error) throw error;

      toast({
        title: "تم تحديث المركز",
        description: "تم تحديث مركز الشرطة بنجاح"
      });

      setEditingStation(null);
      fetchStations();
    } catch (error) {
      console.error('Error updating station:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المركز",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStation = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المركز؟ سيتم إزالة ربط جميع الأرقام بهذا المركز.')) return;

    try {
      const { error } = await supabase
        .from('police_stations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم حذف المركز",
        description: "تم حذف مركز الشرطة بنجاح"
      });

      fetchStations();
      fetchContacts(); // Refresh contacts to show updated station links
    } catch (error) {
      console.error('Error deleting station:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المركز",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">لوحة الإدارة</h1>
          <p className="text-white/80 text-lg">
            إدارة الأخبار ومراكز الشرطة وأرقام الطوارئ
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        {/* Main Content */}
        <GlassCard className="max-w-6xl mx-auto">
          <Tabs defaultValue="news" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="news">إدارة الأخبار</TabsTrigger>
              <TabsTrigger value="stations">إدارة مراكز الشرطة</TabsTrigger>
              <TabsTrigger value="contacts">إدارة أرقام الطوارئ</TabsTrigger>
            </TabsList>

            {/* News Management */}
            <TabsContent value="news" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">إضافة خبر جديد</h3>
                <div className="grid gap-4">
                  <Input
                    placeholder="عنوان الخبر"
                    value={newNews.title}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  />
                  <Input
                    placeholder="فئة الخبر"
                    value={newNews.category}
                    onChange={(e) => setNewNews({ ...newNews, category: e.target.value })}
                  />
                  <Textarea
                    placeholder="ملخص الخبر"
                    value={newNews.summary}
                    onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
                  />
                  <Textarea
                    placeholder="محتوى الخبر"
                    value={newNews.content}
                    onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                    rows={4}
                  />
                  <Button onClick={handleAddNews} className="w-fit">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة خبر
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">الأخبار الحالية</h3>
                <div className="space-y-4">
                  {news.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      {editingNews?.id === item.id ? (
                        <div className="space-y-4">
                          <Input
                            value={editingNews.title}
                            onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                          />
                          <Input
                            value={editingNews.category}
                            onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value })}
                          />
                          <Textarea
                            value={editingNews.summary}
                            onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                          />
                          <Textarea
                            value={editingNews.content || ''}
                            onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateNews} size="sm">
                              <Save className="ml-2 h-4 w-4" />
                              حفظ
                            </Button>
                            <Button onClick={() => setEditingNews(null)} variant="outline" size="sm">
                              <X className="ml-2 h-4 w-4" />
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                          <p className="text-sm mt-2">{item.summary}</p>
                          <div className="flex gap-2 mt-4">
                            <Button onClick={() => setEditingNews(item)} variant="outline" size="sm">
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </Button>
                            <Button onClick={() => handleDeleteNews(item.id)} variant="destructive" size="sm">
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Emergency Contacts Management */}
            <TabsContent value="contacts" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">إضافة رقم طوارئ جديد</h3>
                <div className="grid gap-4">
                  <Input
                    placeholder="العنوان"
                    value={newContact.title}
                    onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                  />
                  <Input
                    placeholder="رقم الهاتف"
                    value={newContact.number}
                    onChange={(e) => setNewContact({ ...newContact, number: e.target.value })}
                  />
                  <Input
                    placeholder="نوع الخدمة (emergency, police, fire, etc.)"
                    value={newContact.type}
                    onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
                  />
                  <Input
                    placeholder="ترتيب الأولوية (رقم)"
                    type="number"
                    value={newContact.order_priority}
                    onChange={(e) => setNewContact({ ...newContact, order_priority: parseInt(e.target.value) || 0 })}
                  />
                  <Select 
                    value={newContact.station_id} 
                    onValueChange={(value) => setNewContact({ ...newContact, station_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مركز الشرطة (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون مركز</SelectItem>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name} - {station.area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="الوصف"
                    value={newContact.description}
                    onChange={(e) => setNewContact({ ...newContact, description: e.target.value })}
                  />
                  <Button onClick={handleAddContact} className="w-fit">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة رقم
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">أرقام الطوارئ الحالية</h3>
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border rounded-lg p-4">
                      {editingContact?.id === contact.id ? (
                        <div className="space-y-4">
                          <Input
                            value={editingContact.title}
                            onChange={(e) => setEditingContact({ ...editingContact, title: e.target.value })}
                          />
                          <Input
                            value={editingContact.number}
                            onChange={(e) => setEditingContact({ ...editingContact, number: e.target.value })}
                          />
                          <Input
                            value={editingContact.type}
                            onChange={(e) => setEditingContact({ ...editingContact, type: e.target.value })}
                          />
                          <Input
                            type="number"
                            value={editingContact.order_priority}
                            onChange={(e) => setEditingContact({ ...editingContact, order_priority: parseInt(e.target.value) || 0 })}
                          />
                          <Select 
                            value={editingContact.station_id || ""} 
                            onValueChange={(value) => setEditingContact({ ...editingContact, station_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر مركز الشرطة (اختياري)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">بدون مركز</SelectItem>
                              {stations.map((station) => (
                                <SelectItem key={station.id} value={station.id}>
                                  {station.name} - {station.area}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            value={editingContact.description || ''}
                            onChange={(e) => setEditingContact({ ...editingContact, description: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateContact} size="sm">
                              <Save className="ml-2 h-4 w-4" />
                              حفظ
                            </Button>
                            <Button onClick={() => setEditingContact(null)} variant="outline" size="sm">
                              <X className="ml-2 h-4 w-4" />
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{contact.title}</h4>
                              <p className="text-lg font-mono">{contact.number}</p>
                              <p className="text-sm text-muted-foreground">{contact.type}</p>
                              {contact.station_id && (
                                <p className="text-sm text-blue-600">
                                  المركز: {stations.find(s => s.id === contact.station_id)?.name}
                                </p>
                              )}
                              <p className="text-sm mt-2">{contact.description}</p>
                              <p className="text-xs text-muted-foreground">الأولوية: {contact.order_priority}</p>
                            </div>
                            <div className="text-sm">
                              {contact.available ? (
                                <span className="text-green-600">متاح</span>
                              ) : (
                                <span className="text-red-600">غير متاح</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button onClick={() => setEditingContact(contact)} variant="outline" size="sm">
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </Button>
                            <Button onClick={() => handleDeleteContact(contact.id)} variant="destructive" size="sm">
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Police Stations Management */}
            <TabsContent value="stations" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">إضافة مركز شرطة جديد</h3>
                <div className="grid gap-4">
                  <Input
                    placeholder="اسم المركز"
                    value={newStation.name}
                    onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                  />
                  <Input
                    placeholder="المنطقة التي يخدمها المركز"
                    value={newStation.area}
                    onChange={(e) => setNewStation({ ...newStation, area: e.target.value })}
                  />
                  <Input
                    placeholder="العنوان (اختياري)"
                    value={newStation.address}
                    onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
                  />
                  <Textarea
                    placeholder="وصف المركز (اختياري)"
                    value={newStation.description}
                    onChange={(e) => setNewStation({ ...newStation, description: e.target.value })}
                  />
                  <Button onClick={handleAddStation} className="w-fit">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة مركز
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">مراكز الشرطة الحالية</h3>
                <div className="space-y-4">
                  {stations.map((station) => (
                    <div key={station.id} className="border rounded-lg p-4">
                      {editingStation?.id === station.id ? (
                        <div className="space-y-4">
                          <Input
                            value={editingStation.name}
                            onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
                          />
                          <Input
                            value={editingStation.area}
                            onChange={(e) => setEditingStation({ ...editingStation, area: e.target.value })}
                          />
                          <Input
                            value={editingStation.address || ''}
                            onChange={(e) => setEditingStation({ ...editingStation, address: e.target.value })}
                          />
                          <Textarea
                            value={editingStation.description || ''}
                            onChange={(e) => setEditingStation({ ...editingStation, description: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateStation} size="sm">
                              <Save className="ml-2 h-4 w-4" />
                              حفظ
                            </Button>
                            <Button onClick={() => setEditingStation(null)} variant="outline" size="sm">
                              <X className="ml-2 h-4 w-4" />
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{station.name}</h4>
                              <p className="text-primary font-medium">{station.area}</p>
                              {station.address && (
                                <p className="text-sm text-muted-foreground">{station.address}</p>
                              )}
                              {station.description && (
                                <p className="text-sm mt-2">{station.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                عدد الأرقام المرتبطة: {contacts.filter(c => c.station_id === station.id).length}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button onClick={() => setEditingStation(station)} variant="outline" size="sm">
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </Button>
                            <Button onClick={() => handleDeleteStation(station.id)} variant="destructive" size="sm">
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </GlassCard>
      </div>
    </div>
  );
};

export default Admin;