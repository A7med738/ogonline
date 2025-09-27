import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { ShoppingBag, MapPin, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOptimizedImageUrl, handleImageError } from "@/utils/imageUtils";
import { supabase } from "@/integrations/supabase/client";
import { useMalls } from "@/hooks/useOptimizedQuery";
import OptimizedImage from "@/components/OptimizedImage";
import VirtualList from "@/components/VirtualList";
import { SkeletonGrid } from "@/components/SkeletonLoader";

// Cache للبيانات
const CACHE_KEY = 'malls_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

interface CacheData {
  data: any[];
  timestamp: number;
}
const CityMalls = () => {
  const navigate = useNavigate();
  const { data: malls = [], isLoading: loading, error } = useMalls(50);

  // تحسين الأداء باستخدام useMemo للبيانات المحسنة
  const optimizedMalls = useMemo(() => {
    return malls.map(mall => ({
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
  }, [malls]);
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <SkeletonGrid items={6} />
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
          <p className="text-muted-foreground mb-4">{(error as any)?.message || 'حدث خطأ غير متوقع'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
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
              onClick={() => window.location.reload()}
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
                  <OptimizedImage
                    src={mall.image}
                    alt={mall.name}
                    width={400}
                    height={300}
                    className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                    quality={80}
                    lazy={true}
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