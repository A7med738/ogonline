import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  moderation_status: string;
  published_at: string;
  image_url?: string;
}

export const NewsManagement = () => {
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'عام',
    image_url: ''
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error loading news:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الأخبار",
        variant: "destructive"
      });
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const newsData = {
        ...formData,
        moderation_status: 'approved'
      };

      if (editingId) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('news')
          .insert(newsData);

        if (error) throw error;

        // إرسال إشعار للمستخدمين
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            await supabase.functions.invoke('notify-new-news', {
              body: {
                title: `خبر جديد: ${formData.title}`,
                url: 'ogonline://news',
                subtitle: formData.summary || 'اضغط لقراءة التفاصيل'
              },
              headers: {
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              }
            });
          }
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // لا نوقف العملية إذا فشل الإشعار
        }

        setIsAdding(false);
      }

      setFormData({ title: '', summary: '', content: '', category: 'عام', image_url: '' });
      loadNews();
      
      toast({
        title: "تم بنجاح",
        description: editingId ? "تم تحديث الخبر" : "تم إضافة الخبر وإرسال الإشعارات",
      });
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الخبر",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: NewsItem) => {
    setFormData({
      title: item.title,
      summary: item.summary,
      content: item.content || '',
      category: item.category,
      image_url: item.image_url || ''
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      loadNews();
      toast({
        title: "تم بنجاح",
        description: "تم حذف الخبر",
      });
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الخبر",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: '', summary: '', content: '', category: 'عام', image_url: '' });
  };

  const categories = ['عام', 'محلي', 'خدمات', 'مرور', 'أمن', 'أحداث', 'إعلانات'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">إدارة الأخبار</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة خبر جديد
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">عنوان الخبر</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان الخبر"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ملخص الخبر</label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="ملخص مختصر للخبر"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">محتوى الخبر</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="المحتوى الكامل للخبر"
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">صورة الخبر (اختياري)</label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const imageUrl = await uploadImage(file);
                        if (imageUrl) {
                          setFormData({ ...formData, image_url: imageUrl });
                        }
                      }
                    }}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4 animate-spin" />
                      جاري الرفع...
                    </div>
                  )}
                </div>
                {formData.image_url && (
                  <div className="relative">
                    <img 
                      src={formData.image_url} 
                      alt="معاينة الصورة" 
                      className="max-w-xs h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">التصنيف</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
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
        {news.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 flex-1">
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded border flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant={item.moderation_status === 'approved' ? 'default' : 'destructive'}>
                      {item.moderation_status === 'approved' ? 'مقبول' : item.moderation_status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.published_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  تعديل
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
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