import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  published_at: string;
  image_url?: string;
}
export const LatestNewsSection = () => {
  const navigate = useNavigate();
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchLatestNews();
  }, []);
  const fetchLatestNews = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('news').select('id, title, summary, category, published_at, image_url').order('published_at', {
        ascending: false
      }).limit(3);
      if (error) throw error;
      if (data) setLatestNews(data);
    } catch (error) {
      console.error('Error fetching latest news:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
      </div>;
  }
  if (latestNews.length === 0) {
    return null;
  }
  return <div className="mt-12 animate-fade-in">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">أحدث أخبار المدينة</h2>
        <p className="text-muted-foreground">ابق على اطلاع بآخر المستجدات والأحداث</p>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {latestNews.map((news, index) => <div key={news.id} className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glass hover:scale-[1.02] cursor-pointer animate-slide-up" style={{
        animationDelay: `${index * 0.1}s`
      }} onClick={() => navigate('/news')}>
            {/* News Image */}
            {news.image_url && <div className="h-48 overflow-hidden">
                <img src={news.image_url} alt={news.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
              </div>}
            
            {/* News Content */}
            <div className="p-6 space-y-3">
              {/* Category Badge */}
              <span className="inline-block bg-gradient-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                {news.category}
              </span>
              
              {/* Title */}
              
              
              {/* Summary */}
              <p className="text-foreground/80 text-sm line-clamp-3 leading-relaxed">
                {news.summary}
              </p>
              
              {/* Date */}
              <div className="flex items-center text-muted-foreground text-sm pt-2">
                <Calendar className="h-4 w-4 ml-2" />
                <span>
                  {formatDistanceToNow(new Date(news.published_at), {
                addSuffix: true,
                locale: ar
              })}
                </span>
              </div>
            </div>
          </div>)}
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Button onClick={() => navigate('/news')} className="bg-gradient-primary hover:opacity-90 transition-opacity">
          عرض جميع الأخبار
        </Button>
      </div>
    </div>;
};