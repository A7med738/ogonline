import { ArrowRight, Calendar, Clock, X, ChevronLeft, Newspaper, Eye, Heart, Share2, MessageCircle } from "lucide-react";
import { ModernNewsCard } from "@/components/ModernNewsCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { NewsInteractions } from "@/components/NewsInteractions";
import { NewsMediaDisplay } from "@/components/NewsMediaDisplay";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNewsNotifications } from "@/hooks/useNewsNotifications";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  category: string;
  published_at: string;
  created_at: string;
  image_url?: string;
  likes_count?: number;
}

interface NewsMediaItem {
  id: string;
  news_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  file_name?: string;
  order_priority: number;
}

const News = () => {
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [newsMedia, setNewsMedia] = useState<{ [newsId: string]: NewsMediaItem[] }>({});
  const [loading, setLoading] = useState(true);
  const { markNewsAsRead } = useNewsNotifications();

  useEffect(() => {
    fetchNews();
    markNewsAsRead();
  }, []);

  const fetchNews = async () => {
    try {
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (newsError) throw newsError;
      
      if (newsData) {
        // Fetch likes count for each news item
        const newsWithLikes = await Promise.all(
          newsData.map(async (news) => {
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
        
        setNewsData(newsWithLikes);
        
        // Fetch media for each news item
        const mediaMap: { [newsId: string]: NewsMediaItem[] } = {};
        
        for (const news of newsData) {
          const { data: mediaData, error: mediaError } = await supabase
            .from('news_media')
            .select('*')
            .eq('news_id', news.id)
            .order('order_priority', { ascending: true });
          
          if (!mediaError && mediaData) {
            mediaMap[news.id] = mediaData.map(item => ({
              ...item,
              media_type: item.media_type as 'image' | 'video'
            }));
          }
        }
        
        setNewsMedia(mediaMap);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="px-4 py-6">

        {/* News Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {loading ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="col-span-full text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
              <p className="text-gray-600 text-lg">جاري تحميل الأخبار...</p>
            </motion.div>
          ) : newsData.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="col-span-full text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <Newspaper className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد أخبار</h3>
              <p className="text-gray-500">لا توجد أخبار متاحة حالياً</p>
            </motion.div>
          ) : (
            newsData.map((news, index) => {
              const mediaItems = newsMedia[news.id] || [];
              const hasFallbackImage = news.image_url && mediaItems.length === 0;
              
              return (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.1 }}
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <div>
                        <ModernNewsCard
                          id={news.id}
                          title={news.title}
                          summary={news.summary}
                          content={news.content || undefined}
                          category={news.category}
                          publishedAt={news.published_at}
                          imageUrl={mediaItems.length > 0 ? mediaItems[0].media_url : news.image_url}
                          likesCount={news.likes_count || 0}
                          viewsCount={0}
                          commentsCount={0}
                          onReadMore={() => {}}
                          onLike={() => {}}
                          onShare={() => {}}
                          onComment={() => {}}
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-right mb-4">
                          {news.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 mt-4">
                        {/* Category and Date */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 shadow-lg w-fit">
                            {news.category}
                          </Badge>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDistanceToNow(new Date(news.published_at), {
                                addSuffix: true,
                                locale: ar
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Media Display in Modal */}
                        {mediaItems.length > 0 && (
                          <div className="rounded-lg overflow-hidden">
                            <NewsMediaDisplay media={mediaItems} />
                          </div>
                        )}

                        {/* Full Content */}
                        <div className="prose prose-lg max-w-none text-right">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                            {news.content || news.summary}
                          </p>
                        </div>

                        {/* News Interactions in Modal */}
                        <div className="border-t pt-4">
                          <NewsInteractions newsId={news.id} />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default News;