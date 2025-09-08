import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, Calendar } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  priority: number;
  expires_at: string;
  created_at: string;
}

export const AnnouncementsManagement = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    is_active: true,
    priority: 0,
    expires_at: ''
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعلانات",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const announcementData = {
        ...formData,
        expires_at: formData.expires_at || null,
        priority: parseInt(formData.priority.toString())
      };

      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert(announcementData);

        if (error) throw error;
        setIsAdding(false);
      }

      setFormData({
        title: '',
        content: '',
        type: 'info',
        is_active: true,
        priority: 0,
        expires_at: ''
      });
      loadAnnouncements();
      
      toast({
        title: "تم بنجاح",
        description: editingId ? "تم تحديث الإعلان" : "تم إضافة الإعلان",
      });
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعلان",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      is_active: announcement.is_active,
      priority: announcement.priority,
      expires_at: announcement.expires_at ? new Date(announcement.expires_at).toISOString().slice(0, 16) : ''
    });
    setEditingId(announcement.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      loadAnnouncements();
      toast({
        title: "تم بنجاح",
        description: "تم حذف الإعلان",
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الإعلان",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      loadAnnouncements();
      toast({
        title: "تم بنجاح",
        description: !currentStatus ? "تم تفعيل الإعلان" : "تم إيقاف الإعلان",
      });
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast({
        title: "خطأ",
        description: "فشل في تغيير حالة الإعلان",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      is_active: true,
      priority: 0,
      expires_at: ''
    });
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      info: 'معلومات',
      warning: 'تحذير',
      urgent: 'عاجل',
      maintenance: 'صيانة'
    };
    return types[type] || type;
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'urgent': return 'destructive';
      case 'warning': return 'outline';
      default: return 'default';
    }
  };

  const isExpired = (expiresAt: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">إدارة الإعلانات</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة إعلان جديد
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">عنوان الإعلان</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان الإعلان"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">محتوى الإعلان</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="نص الإعلان بالتفصيل"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">نوع الإعلان</label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">معلومات</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="urgent">عاجل</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الأولوية</label>
              <Input
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                placeholder="0"
                type="number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">تاريخ انتهاء الصلاحية (اختياري)</label>
              <Input
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                type="datetime-local"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label className="text-sm">نشط</label>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {editingId ? 'تحديث' : 'حفظ'}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                إلغاء
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium">{announcement.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getTypeBadgeVariant(announcement.type)}>
                    {getTypeLabel(announcement.type)}
                  </Badge>
                  {announcement.priority > 0 && (
                    <Badge variant="outline">أولوية: {announcement.priority}</Badge>
                  )}
                  <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                    {announcement.is_active ? 'نشط' : 'غير نشط'}
                  </Badge>
                  {announcement.expires_at && (
                    <Badge variant={isExpired(announcement.expires_at) ? 'destructive' : 'outline'}>
                      <Calendar className="h-3 w-3 ml-1" />
                      {isExpired(announcement.expires_at) ? 'منتهي الصلاحية' : 'له تاريخ انتهاء'}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  تم الإنشاء: {new Date(announcement.created_at).toLocaleDateString('ar-EG')}
                  {announcement.expires_at && (
                    <span className="mr-4">
                      ينتهي: {new Date(announcement.expires_at).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStatus(announcement.id, announcement.is_active)}
                >
                  {announcement.is_active ? 'إيقاف' : 'تفعيل'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(announcement)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  تعديل
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(announcement.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};