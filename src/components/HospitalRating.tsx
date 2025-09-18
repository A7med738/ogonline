import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, Users, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HospitalRating {
  id: string;
  hospital_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface HospitalRatingProps {
  hospitalId: string;
  hospitalName: string;
  currentRating?: number;
  totalRatings?: number;
  onRatingUpdate?: (newRating: number, totalRatings: number) => void;
}

const HospitalRating: React.FC<HospitalRatingProps> = ({ 
  hospitalId, 
  hospitalName, 
  currentRating = 0, 
  totalRatings = 0,
  onRatingUpdate
}) => {
  const [ratings, setRatings] = useState<HospitalRating[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRatings();
  }, [hospitalId]);

  const loadRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('hospital_ratings')
        .select('*')
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Hospital ratings table not found, using local storage');
        const localRatings = getHospitalRatings(hospitalId);
        setRatings(localRatings);
        return;
      }
      setRatings(data || []);
    } catch (error) {
      console.log('Error loading ratings, using local storage:', error);
      const localRatings = getHospitalRatings(hospitalId);
      setRatings(localRatings);
    }
  };

  const handleSubmitRating = async () => {
    if (newRating === 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار تقييم من 1 إلى 5 نجوم',
        variant: 'destructive',
      });
      return;
    }

    if (!userName.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسمك',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const ratingData = {
        hospital_id: hospitalId,
        user_name: userName.trim(),
        rating: newRating,
        comment: newComment.trim() || null,
      };

      const { error } = await supabase
        .from('hospital_ratings')
        .insert([ratingData]);

      if (error) {
        // استخدام التخزين المحلي كبديل
        saveHospitalRating(hospitalId, ratingData);
        toast({
          title: 'تم الحفظ محلياً',
          description: 'تم حفظ التقييم في التخزين المحلي',
        });
      } else {
        toast({
          title: 'تم بنجاح',
          description: 'تم إضافة التقييم بنجاح',
        });
      }

      // تحديث القائمة
      await loadRatings();
      
      // إغلاق النافذة
      setIsDialogOpen(false);
      setNewRating(0);
      setNewComment('');
      setUserName('');

      // تحديث التقييم الإجمالي
      if (onRatingUpdate) {
        const avgRating = calculateAverageRating();
        onRatingUpdate(avgRating, ratings.length + 1);
      }

    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة التقييم',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const getHospitalRatings = (hospitalId: string): HospitalRating[] => {
    try {
      const stored = localStorage.getItem(`hospital_ratings_${hospitalId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveHospitalRating = (hospitalId: string, ratingData: any) => {
    try {
      const existingRatings = getHospitalRatings(hospitalId);
      const newRating = {
        id: Date.now().toString(),
        ...ratingData,
        created_at: new Date().toISOString(),
      };
      const updatedRatings = [newRating, ...existingRatings];
      localStorage.setItem(`hospital_ratings_${hospitalId}`, JSON.stringify(updatedRatings));
    } catch (error) {
      console.error('Error saving rating locally:', error);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onStarClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
        onClick={interactive && onStarClick ? () => onStarClick(i + 1) : undefined}
      />
    ));
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="space-y-3">
      {/* عرض التقييم الحالي */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {renderStars(Math.floor(averageRating))}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({ratings.length} تقييم)
          </span>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <MessageSquare className="h-3 w-3 ml-1" />
              تقييم
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تقييم {hospitalName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userName">اسمك *</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="أدخل اسمك"
                />
              </div>
              
              <div>
                <Label>التقييم *</Label>
                <div className="flex items-center space-x-1 mt-2">
                  {renderStars(newRating, true, setNewRating)}
                  <span className="text-sm text-gray-600 mr-2">
                    {newRating > 0 ? `${newRating} من 5` : 'اختر التقييم'}
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="comment">تعليق (اختياري)</Label>
                <Textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="شاركنا تجربتك مع هذا المستشفى"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={handleSubmitRating}
                  disabled={loading}
                >
                  {loading ? 'جاري الحفظ...' : 'إرسال التقييم'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* عرض التقييمات السابقة */}
      {ratings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">آراء المستخدمين</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {ratings.slice(0, 3).map((rating) => (
              <div key={rating.id} className="bg-gray-50 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1">
                    {renderStars(rating.rating)}
                    <span className="text-xs font-medium text-gray-700">{rating.user_name}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-xs text-gray-600 leading-relaxed">{rating.comment}</p>
                )}
              </div>
            ))}
            {ratings.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{ratings.length - 3} تقييمات أخرى
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalRating;
