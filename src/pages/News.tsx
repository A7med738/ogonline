import { ArrowRight, Calendar, Clock, X, ChevronLeft, Newspaper, Eye, Heart, Share2, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {loading ? (
            <motion.div 
              variants={itemVariants}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-emerald-200 to-cyan-200 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
              <p className="text-gray-600 text-lg">جاري تحميل الأخبار...</p>
            </motion.div>
          ) : newsData.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="text-center py-16"
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
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="w-full"
                >
                  <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-0">
                      {/* News Image */}
                      {mediaItems.length > 0 ? (
                        <div className="h-48 sm:h-56 overflow-hidden relative">
                          <img 
                            src={mediaItems[0].media_url} 
                            alt={news.title} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 shadow-lg backdrop-blur-sm">
                              {news.category}
                            </Badge>
                          </div>
                        </div>
                      ) : hasFallbackImage ? (
                        <div className="h-48 sm:h-56 overflow-hidden relative">
                          <img 
                            src={news.image_url} 
                            alt={news.title} 
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 shadow-lg backdrop-blur-sm">
                              {news.category}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 sm:h-56 bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center relative">
                          <div className="text-center">
                            <Newspaper className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                            <p className="text-emerald-600 font-medium">أخبار المدينة</p>
                          </div>
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 shadow-lg backdrop-blur-sm">
                              {news.category}
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      {/* News Content */}
                      <div className="p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2 leading-tight mb-3 hover:text-emerald-600 transition-colors">
                          {news.title}
                        </h2>
                        
                        <p className="text-gray-600 text-sm sm:text-base line-clamp-3 leading-relaxed mb-4">
                          {news.summary}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                            <span>
                              {formatDistanceToNow(new Date(news.published_at), {
                                addSuffix: true,
                                locale: ar
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 rtl:space-x-reverse text-gray-400">
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm">{news.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1 rtl:space-x-reverse">
                              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                          </div>
                        </div>

                        {/* Read More Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <motion.div
                              whileHover={{ x: 5 }}
                              className="flex items-center justify-center w-full"
                            >
                              <Button 
                                variant="outline" 
                                className="w-full bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200 hover:from-emerald-100 hover:to-cyan-100 text-emerald-700 hover:text-emerald-800"
                              >
                                <span className="text-sm sm:text-base">اقرأ المزيد</span>
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              </Button>
                            </motion.div>
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
                      </div>
                    </CardContent>
                  </Card>
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