import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye } from "lucide-react";

interface LostFoundItem {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  location_description: string;
  contact_method: string;
  contact_details: string;
  image_url?: string;
  date_reported: string;
  status: string;
  profiles?: {
    full_name: string;
  };
}

export const LostAndFoundManagement = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'active' | 'rejected' | 'all'>('pending');

  useEffect(() => {
    fetchItems(statusFilter);
  }, [statusFilter]);

  const fetchItems = async (status: 'pending' | 'active' | 'rejected' | 'all') => {
    try {
      let query = supabase
        .from('lost_and_found_items')
        .select(`
          *,
          profiles!lost_and_found_items_user_id_fkey (
            full_name
          )
        `);

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('date_reported', { ascending: false });

      if (error) throw error;
      setItems((data as any) || []);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: 'active' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('lost_and_found_items')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      // تحديث القائمة
      setItems(items.filter(item => item.id !== itemId));
      
      toast({
        title: "تم التحديث",
        description: `تم ${newStatus === 'active' ? 'قبول' : 'رفض'} البلاغ بنجاح`,
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث البلاغ",
        variant: "destructive",
      });
    }
  };

  const getTypeText = (type: string) => {
    return type === 'lost' ? 'مفقود' : 'موجود';
  };

  const getTypeColor = (type: string) => {
    return type === 'lost' ? 'destructive' : 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إدارة المفقودات والموجودات</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{items.length} نتيجة</Badge>
          <div className="hidden md:flex items-center gap-2">
            <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('pending')}>
              قيد المراجعة
            </Button>
            <Button variant={statusFilter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('active')}>
              المنشورة
            </Button>
            <Button variant={statusFilter === 'rejected' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('rejected')}>
              المرفوضة
            </Button>
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>
              الكل
            </Button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-muted-foreground">لا توجد نتائج لهذا الفلتر</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <GlassCard key={item.id} className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {item.image_url && (
                  <div className="md:w-32 md:h-32 w-full h-48 flex-shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{item.title}</h4>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={getTypeColor(item.type)}>
                          {getTypeText(item.type)}
                        </Badge>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">المبلغ:</span> {item.profiles?.full_name || "غير محدد"}
                    </div>
                    <div>
                      <span className="font-medium">التاريخ:</span> {format(new Date(item.date_reported), "dd MMM yyyy", { locale: ar })}
                    </div>
                    <div>
                      <span className="font-medium">الموقع:</span> {item.location_description}
                    </div>
                    <div>
                      <span className="font-medium">التواصل:</span> {item.contact_details}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      onClick={() => handleStatusChange(item.id, 'active')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 ml-1" />
                      قبول
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(item.id, 'rejected')}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="w-4 h-4 ml-1" />
                      رفض
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};