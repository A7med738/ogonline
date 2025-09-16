import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MessageSquare, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getShopRatings, addShopRating, getShopRatingStats } from '@/utils/shopRatingsStorage';

interface ShopRating {
  id: string;
  shop_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ShopRatingProps {
  shopId: string;
  shopName: string;
  currentRating?: number;
  totalRatings?: number;
  onRatingUpdate?: (shopId: string, averageRating: number, totalRatings: number) => void;
}

const ShopRating: React.FC<ShopRatingProps> = ({ 
  shopId, 
  shopName, 
  currentRating = 0, 
  totalRatings = 0,
  onRatingUpdate
}) => {
  const [ratings, setRatings] = useState<ShopRating[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRatings();
  }, [shopId]);

  const loadRatings = async () => {
    try {
      // محاولة تحميل التقييمات من قاعدة البيانات أولاً
      const { data, error } = await supabase
        .from('shop_ratings')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Shop ratings table not found, using local storage');
        // استخدام التخزين المحلي
        const localRatings = getShopRatings(shopId);
        setRatings(localRatings);
        return;
      }
      setRatings(data || []);
    } catch (error) {
      console.log('Error loading ratings, using local storage:', error);
      // استخدام التخزين المحلي
      const localRatings = getShopRatings(shopId);
      setRatings(localRatings);
    }
  };

  const handleSubmitRating = async () => {
    if (!userName.trim() || newRating === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسمك وتقييمك",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // محاولة إرسال التقييم إلى قاعدة البيانات
      const { error } = await supabase
        .from('shop_ratings')
        .insert({
          shop_id: shopId,
          user_name: userName.trim(),
          rating: newRating,
          comment: newComment.trim()
        });

      if (error) {
        console.log('Shop ratings table not found, storing locally');
        // تخزين محلي مؤقت
        const newRatingData = addShopRating({
          shop_id: shopId,
          user_name: userName.trim(),
          rating: newRating,
          comment: newComment.trim()
        });
        
        setRatings(prev => [newRatingData, ...prev]);
        
        // تحديث البيانات في الصفحة الرئيسية
        if (onRatingUpdate) {
          const stats = getShopRatingStats(shopId);
          onRatingUpdate(shopId, stats.averageRating, stats.totalRatings);
        }
        
        toast({
          title: "تم بنجاح",
          description: "تم إضافة تقييمك بنجاح"
        });
      } else {
        toast({
          title: "تم بنجاح",
          description: "تم إضافة تقييمك بنجاح"
        });
        
        // Reload ratings
        await loadRatings();
      }

      // Reset form
      setNewRating(0);
      setNewComment('');
      setUserName('');
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة التقييم",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && setNewRating(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0;

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            تقييمات {shopName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">
                من 5 نجوم
              </div>
            </div>
            <div className="flex-1">
              {renderStars(Math.round(averageRating))}
              <div className="text-sm text-gray-600 mt-1">
                {ratings.length} تقييم
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  أضف تقييمك
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>تقييم {shopName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userName">اسمك</Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div>
                    <Label>تقييمك</Label>
                    <div className="mt-2">
                      {renderStars(newRating, true)}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="comment">تعليقك (اختياري)</Label>
                    <Textarea
                      id="comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="شاركنا رأيك في هذا المحل..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleSubmitRating} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Recent Ratings */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              التقييمات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratings.slice(0, 5).map((rating) => (
                <div key={rating.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{rating.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(rating.rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-sm text-gray-700 mt-2 pr-6">
                      {rating.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShopRating;
