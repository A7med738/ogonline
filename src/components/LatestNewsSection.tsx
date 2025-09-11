import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Newspaper, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  published_at: string;
  image_url?: string;
}

interface NewsMediaItem {
  id: string;
  news_id: string;
  media_url: string;
  media_type: string;
  order_priority: number;
}
export const LatestNewsSection = () => {
  const navigate = useNavigate();
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [newsMedia, setNewsMedia] = useState<Record<string, NewsMediaItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    fetchLatestNews();
  }, []);

  // Auto-rotate news every 4 seconds
  useEffect(() => {
    if (latestNews.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % latestNews.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [latestNews.length]); // Only depend on latestNews.length, not currentIndex

  const fetchLatestNews = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('news').select('id, title, summary, category, published_at, image_url').order('published_at', {
        ascending: false
      }).limit(5); // Get 5 news for rotation

      if (error) throw error;
      if (data) {
        setLatestNews(data);
        
        // Fetch media for all news items
        const newsIds = data.map(item => item.id);
        const { data: mediaData, error: mediaError } = await supabase
          .from('news_media')
          .select('*')
          .in('news_id', newsIds)
          .eq('media_type', 'image')
          .order('order_priority', { ascending: true });

        if (mediaError) {
          console.error('Error fetching news media:', mediaError);
        } else {
          // Group media by news_id
          const mediaByNewsId: Record<string, NewsMediaItem[]> = {};
          mediaData?.forEach(media => {
            if (!mediaByNewsId[media.news_id]) {
              mediaByNewsId[media.news_id] = [];
            }
            mediaByNewsId[media.news_id].push(media);
          });
          setNewsMedia(mediaByNewsId);
        }
      }
    } catch (error) {
      console.error('Error fetching latest news:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleNext = () => {
    if (isAnimating || latestNews.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % latestNews.length);
      setIsAnimating(false);
    }, 300);
  };
  const handlePrev = () => {
    if (isAnimating || latestNews.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + latestNews.length) % latestNews.length);
      setIsAnimating(false);
    }, 300);
  };
  if (loading) {
    return (
      <div className="text-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"
        />
      </div>
    );
  }

  if (latestNews.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-8 sm:mt-12"
    >
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Newspaper className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">أحدث أخبار المدينة</h2>
        </div>
      </motion.div>

      {/* News Carousel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-sm sm:max-w-md mx-auto relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative"
          >
            <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate('/news')}>
              {/* News Image */}
              {(latestNews[currentIndex]?.image_url || (newsMedia[latestNews[currentIndex]?.id] && newsMedia[latestNews[currentIndex]?.id].length > 0)) && (
                <div className="h-40 sm:h-48 overflow-hidden relative">
                  <img 
                    src={latestNews[currentIndex]?.image_url || (newsMedia[latestNews[currentIndex]?.id] && newsMedia[latestNews[currentIndex]?.id][0]?.media_url)} 
                    alt={latestNews[currentIndex]?.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 shadow-lg">
                      {latestNews[currentIndex]?.category}
                    </Badge>
                  </div>
                </div>
              )}
              
              {/* News Content */}
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2 leading-tight mb-2 group-hover:text-emerald-600 transition-colors">
                  {latestNews[currentIndex]?.title}
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4">
                  {latestNews[currentIndex]?.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    <span>
                      {formatDistanceToNow(new Date(latestNews[currentIndex]?.published_at), {
                        addSuffix: true,
                        locale: ar
                      })}
                    </span>
                  </div>
                  
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center text-emerald-600 text-sm font-medium"
                  >
                    <span className="hidden sm:inline">اقرأ المزيد</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {latestNews.length > 1 && (
          <>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePrev} 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 border-0 shadow-lg" 
                disabled={isAnimating}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNext} 
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 border-0 shadow-lg" 
                disabled={isAnimating}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
          </>
        )}

        {/* Indicators */}
        {latestNews.length > 1 && (
          <div className="flex justify-center space-x-2 rtl:space-x-reverse mt-4">
            {latestNews.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentIndex(index);
                      setIsAnimating(false);
                    }, 300);
                  }
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 w-8" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* View All Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-6"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => navigate('/news')}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg px-6 py-2"
          >
            عرض جميع الأخبار
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};