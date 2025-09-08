import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, User, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface LostAndFoundItem {
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
  date_lost_found?: string;
  status: string;
  profiles?: {
    full_name: string;
  } | null;
}

const LostAndFoundView = () => {
  const [items, setItems] = useState<LostAndFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('lost_and_found_items')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('is_active', true)
        .order('date_reported', { ascending: false });

      if (error) throw error;
      setItems(data as any || []);
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

  const filteredItems = items.filter(item => 
    filter === 'all' || item.type === filter
  ).filter(item => item.status === 'active'); // إظهار البلاغات المعتمدة فقط

  const getTypeText = (type: string) => {
    return type === 'lost' ? 'مفقود' : 'موجود';
  };

  const getTypeColor = (type: string) => {
    return type === 'lost' ? 'destructive' : 'default';
  };

  const formatContactMethod = (method: string) => {
    switch (method) {
      case 'phone': return 'هاتف';
      case 'email': return 'بريد إلكتروني';
      case 'both': return 'هاتف وبريد إلكتروني';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h3 className="md:text-2xl text-xl font-bold text-foreground">المفقودات والموجودات</h3>
          <p className="text-muted-foreground text-sm mt-2">جميع البلاغات المسجلة</p>
        </div>

        {/* Filter buttons */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            الكل
          </Button>
          <Button
            variant={filter === 'lost' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('lost')}
          >
            مفقودات
          </Button>
          <Button
            variant={filter === 'found' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('found')}
          >
            موجودات
          </Button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">لا توجد بلاغات</h4>
            <p className="text-muted-foreground">لا توجد بلاغات مسجلة حالياً</p>
          </div>
        ) : (
          <div className="grid gap-4 max-w-4xl mx-auto">
            {filteredItems.map((item) => (
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
                      <h4 className="text-lg font-semibold text-foreground">{item.title}</h4>
                      <Badge variant={getTypeColor(item.type)}>
                        {getTypeText(item.type)}
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{item.profiles?.full_name || "غير محدد"}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(item.date_reported), "dd MMM yyyy", { locale: ar })}</span>
                      </div>

                      {item.location_description && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location_description}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm">
                      {item.contact_method === 'phone' || item.contact_method === 'both' ? (
                        <Phone className="w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      <span className="text-muted-foreground">
                        للتواصل: {formatContactMethod(item.contact_method)}
                      </span>
                      <span className="text-foreground font-medium">{item.contact_details}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <Badge variant="outline">{item.status === 'active' ? 'نشط' : item.status}</Badge>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LostAndFoundView;