import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { ShoppingBag, MapPin, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOptimizedImageUrl, handleImageError } from "@/utils/imageUtils";
import { supabase } from "@/integrations/supabase/client";

// Cache للبيانات
const CACHE_KEY = 'malls_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

interface CacheData {
  data: any[];
  timestamp: number;
}
const CityMalls = () => {
  const navigate = useNavigate();
  const [malls, setMalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  // دالة للحصول على البيانات من Cache
  const getCachedData = (): any[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp }: CacheData = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Error reading cache:', error);
    }
    return null;
  };

  // دالة لحفظ البيانات في Cache
  const setCachedData = (data: any[]) => {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error saving cache:', error);
    }
  };

  useEffect(() => {
    loadMalls();
  }, []);

  const loadMalls = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // محاولة جلب البيانات من Cache أولاً
      if (!forceRefresh && isInitialLoad.current) {
        const cachedData = getCachedData();
        if (cachedData) {
          setMalls(cachedData);
          setLoading(false);
          isInitialLoad.current = false;
          return;
        }
      }
      
      // جلب البيانات من قاعدة البيانات
      const { data, error } = await supabase
        .from('malls')
        .select(`
          id, 
          name, 
          description, 
          image_url, 
          rating, 
          is_open, 
          closing_time, 
          address, 
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      // تحسين معالجة البيانات
      const mallsData = (data || []).map(mall => ({
        id: mall.id,
        name: mall.name,
        description: mall.description || '',
        image: mall.image_url || '/placeholder.svg',
        rating: mall.rating || 0,
        isOpen: mall.is_open,
        closingTime: mall.closing_time || '11:00 مساءً',
        shops: 0,
        location: mall.address || ''
      }));
      
      setMalls(mallsData);
      setCachedData(mallsData); // حفظ البيانات في Cache
      isInitialLoad.current = false;
    } catch (error) {
      console.error('Error loading malls:', error);
      setError('حدث خطأ في تحميل المولات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // تحسين الأداء باستخدام useMemo للبيانات المحسنة
  const optimizedMalls = useMemo(() => {
    return malls.map(mall => ({
      ...mall,
      optimizedImage: getOptimizedImageUrl(mall.image, 400, 300, 80)
    }));
  }, [malls]);
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المولات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <ShoppingBag className="w-16 h-16 mx-auto mb-2" />
            <p className="text-lg font-semibold">خطأ في التحميل</p>
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadMalls} className="mt-4">
            المحاولة مرة أخرى
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 py-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">مولات المدينة</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadMalls(true)}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              تحديث
            </Button>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            اكتشف أفضل مراكز التسوق في مدينتك ({malls.length} مول)
          </p>
        </div>

        {malls.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold text-muted-foreground mb-2">لا توجد مولات متاحة</p>
            <p className="text-sm text-muted-foreground">سيتم إضافة المولات قريباً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {optimizedMalls.map(mall => (
              <Card 
                key={mall.id} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/mall/${mall.id}`)}
              >
                <div className="relative overflow-hidden">
                  {/* Placeholder أثناء التحميل */}
                  <div className="w-full h-40 sm:h-48 bg-gray-200 animate-pulse rounded-t-lg flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <img 
                    src={mall.optimizedImage} 
                    alt={mall.name} 
                    className="absolute inset-0 w-full h-40 sm:h-48 object-cover rounded-t-lg transition-all duration-500 opacity-0"
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onError={(e) => {
                      handleImageError(e);
                      e.currentTarget.style.opacity = '1';
                    }}
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold line-clamp-2">{mall.name}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{mall.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-2">
                    {mall.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{mall.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>{mall.shops} محل</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span>يغلق {mall.closingTime}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/mall/${mall.id}`);
                    }}
                  >
                    عرض التفاصيل
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default CityMalls;