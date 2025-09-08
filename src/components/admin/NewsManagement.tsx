import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  moderation_status: string;
  published_at: string;
}

export const NewsManagement = () => {
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'عام'
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

  const handleSubmit = async () => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('news')
          .update({
            ...formData,
            moderation_status: 'approved'
          })
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('news')
          .insert({
            ...formData,
            moderation_status: 'approved'
          });

        if (error) throw error;
        setIsAdding(false);
      }

      setFormData({ title: '', summary: '', content: '', category: 'عام' });
      loadNews();
      
      toast({
        title: "تم بنجاح",
        description: editingId ? "تم تحديث الخبر" : "تم إضافة الخبر",
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
      category: item.category
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
    setFormData({ title: '', summary: '', content: '', category: 'عام' });
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