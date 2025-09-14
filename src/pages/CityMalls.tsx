import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "@/components/NavigationCard";
import { ShoppingBag, MapPin, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const CityMalls = () => {
  const navigate = useNavigate();

  const [malls, setMalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMalls();
  }, []);

  const loadMalls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('malls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mallsData = (data || []).map(mall => ({
        id: mall.id,
        name: mall.name,
        description: mall.description || '',
        image: mall.image_url || '/placeholder.svg',
        rating: mall.rating || 0,
        isOpen: mall.is_open,
        closingTime: mall.closing_time || '11:00 مساءً',
        shops: 0, // This would need to be calculated from shops table
        location: mall.address || ''
      }));

      setMalls(mallsData);
    } catch (error) {
      console.error('Error loading malls:', error);
    } finally {
      setLoading(false);
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
      <div className="container mx-auto px-3 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">مولات المدينة</h1>
          <p className="text-sm sm:text-base text-muted-foreground">اكتشف أفضل مراكز التسوق في مدينتك</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {malls.map((mall) => (
            <Card 
              key={mall.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/mall/${mall.id}`)}
            >
              <div className="relative">
                <img 
                  src={mall.image} 
                  alt={mall.name}
                  className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={mall.isOpen ? "default" : "secondary"} className="text-xs">
                    {mall.isOpen ? "مفتوح" : "مغلق"}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg sm:text-xl font-semibold">{mall.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{mall.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-muted-foreground mb-4">{mall.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{mall.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    <span>{mall.shops} محل</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>يغلق {mall.closingTime}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4"
                  onClick={(e) => {
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
      </div>
    </div>
  );
};

export default CityMalls;
