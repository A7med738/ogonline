import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Phone, Mail, Filter } from "lucide-react";
import { toast } from "sonner";

interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  category: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  contactMethod: string;
  createdAt: string;
  images?: string[];
  deliveryPlace?: string;
}

const BrowseLostAndFound: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LostFoundItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    "حيوان أليف",
    "مفاتيح",
    "محفظة",
    "وثائق رسمية",
    "هاتف",
    "أخرى",
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, typeFilter, categoryFilter]);

  const fetchItems = async () => {
    try {
      // TODO: Replace with actual Supabase query
      // const { data, error } = await supabase
      //   .from('lost_and_found')
      //   .select('*')
      //   .order('created_at', { ascending: false });
      
      // Mock data for now
      const mockItems: LostFoundItem[] = [
        {
          id: "1",
          type: "lost",
          category: "حيوان أليف",
          description: "قطة شيرازية بيضاء اسمها لوسي، عمرها سنتين",
          location: { lat: 30.0444, lng: 31.2357, address: "شارع النيل، حدائق أكتوبر" },
          contactMethod: "01234567890",
          createdAt: "2024-01-15T10:30:00Z",
          images: []
        },
        {
          id: "2",
          type: "found",
          category: "مفاتيح",
          description: "ميدالية مفاتيح عليها شعار سيارة BMW",
          location: { lat: 30.0444, lng: 31.2357, address: "مول حدائق أكتوبر" },
          contactMethod: "01123456789",
          createdAt: "2024-01-14T15:45:00Z",
          deliveryPlace: "تم تسليمه لأمن المجمع",
          images: []
        }
      ];
      
      setItems(mockItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContact = (contactMethod: string) => {
    if (contactMethod.includes('@')) {
      window.open(`mailto:${contactMethod}`, '_self');
    } else {
      window.open(`tel:${contactMethod}`, '_self');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">عرض المفقودات والموجودات</h3>
        </div>

        {/* Filters */}
        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="ابحث في الوصف أو النوع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع البلاغ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="lost">مفقود</SelectItem>
                <SelectItem value="found">موجود</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
              setCategoryFilter("all");
            }}>
              <Filter className="w-4 h-4 ml-2" />
              إعادة تعيين
            </Button>
          </div>
        </GlassCard>

        {/* Results */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد نتائج مطابقة للبحث</p>
            </GlassCard>
          ) : (
            filteredItems.map((item) => (
              <GlassCard key={item.id} className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
                        {item.type === 'lost' ? 'مفقود' : 'موجود'}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location.address || `${item.location.lat.toFixed(4)}, ${item.location.lng.toFixed(4)}`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    {item.deliveryPlace && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                        <strong>مكان التسليم:</strong> {item.deliveryPlace}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <Button
                      size="sm"
                      onClick={() => handleContact(item.contactMethod)}
                      className="w-full"
                    >
                      {item.contactMethod.includes('@') ? (
                        <Mail className="w-4 h-4 ml-1" />
                      ) : (
                        <Phone className="w-4 h-4 ml-1" />
                      )}
                      تواصل
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseLostAndFound;
