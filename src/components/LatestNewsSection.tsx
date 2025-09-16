import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Newspaper, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ModernNewsCard } from '@/components/ModernNewsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  published_at: string;
  image_url?: string;
  likes_count?: number;
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
        if (!isAnimating) {
          setIsAnimating(true);
          setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % latestNews.length);
            setIsAnimating(false);
          }, 200);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [latestNews.length, isAnimating]); // Include isAnimating in dependencies

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
        // Fetch likes count for each news item
        const newsWithLikes = await Promise.all(
          data.map(async (news) => {
            const { count } = await supabase
              .from('news_likes')
              .select('*', { count: 'exact', head: true })
              .eq('news_id', news.id);
            
            return {
              ...news,
              likes_count: count || 0
            };
          })
        );
        
        setLatestNews(newsWithLikes);
        
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
    }, 200);
  };
  const handlePrev = () => {
    if (isAnimating || latestNews.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + latestNews.length) % latestNews.length);
      setIsAnimating(false);
    }, 200);
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
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
            <Newspaper className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            أحدث أخبار المدينة
          </h2>
        </div>
      </motion.div>

      {/* News Carousel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-xs sm:max-w-sm mx-auto relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full"
          >
            <div onClick={() => navigate('/news')} className="cursor-pointer">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative w-full max-w-sm mx-auto"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-0">
                  {/* News Image */}
                  {(latestNews[currentIndex]?.image_url || (newsMedia[latestNews[currentIndex]?.id] && newsMedia[latestNews[currentIndex]?.id].length > 0)) ? (
                    <div className="h-32 overflow-hidden relative">
                      <img 
                        src={latestNews[currentIndex]?.image_url || (newsMedia[latestNews[currentIndex]?.id] && newsMedia[latestNews[currentIndex]?.id][0]?.media_url)} 
                        alt={latestNews[currentIndex]?.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                          {latestNews[currentIndex]?.category}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center relative">
                      <div className="text-center">
                        <Newspaper className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-emerald-600 font-medium text-xs">أخبار المدينة</p>
                      </div>
                      {/* Category Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                          {latestNews[currentIndex]?.category}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* News Title */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight hover:text-emerald-600 transition-colors">
                      {latestNews[currentIndex]?.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {latestNews.length > 1 && (
          <>
            <motion.div
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePrev} 
                className="h-10 w-10 p-0 bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 backdrop-blur-md hover:from-emerald-600 hover:to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full hover:scale-105" 
                disabled={isAnimating}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNext} 
                className="h-10 w-10 p-0 bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 backdrop-blur-md hover:from-emerald-600 hover:to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full hover:scale-105" 
                disabled={isAnimating}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </motion.div>
          </>
        )}

        {/* Indicators */}
        {latestNews.length > 1 && (
          <div className="flex justify-center space-x-3 rtl:space-x-reverse mt-6">
            {latestNews.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentIndex(index);
                      setIsAnimating(false);
                    }, 200);
                  }
                }}
                whileHover={{ scale: 1.3, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "h-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg",
                  index === currentIndex 
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 w-10 shadow-xl ring-2 ring-emerald-200" 
                    : "bg-gray-300 hover:bg-gradient-to-r hover:from-emerald-300 hover:to-cyan-300 w-3 hover:w-6"
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
        className="text-center mt-8"
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => navigate('/news')}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-xl hover:shadow-2xl px-8 py-3 rounded-2xl transition-all duration-300 font-semibold text-sm hover:scale-105 ring-2 ring-emerald-200/50 hover:ring-emerald-300/50"
          >
            <span className="flex items-center gap-2">
              عرض جميع الأخبار
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};