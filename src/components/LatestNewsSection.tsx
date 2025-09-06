import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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
      if (data) setLatestNews(data);
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
    }, 150);
  };
  const handlePrev = () => {
    if (isAnimating || latestNews.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + latestNews.length) % latestNews.length);
      setIsAnimating(false);
    }, 150);
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
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">أحدث أخبار المدينة</h2>
        
      </div>

      {/* Single News Card with Navigation */}
      <div className="max-w-sm mx-auto relative">
        {latestNews.length > 0 && <div className="relative overflow-hidden">
            <div className={`transition-all duration-500 ease-in-out ${isAnimating ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'}`}>
              <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glass cursor-pointer" onClick={() => navigate('/news')}>
                {/* News Image */}
                {latestNews[currentIndex]?.image_url && <div className="h-32 overflow-hidden">
                    <img src={latestNews[currentIndex].image_url} alt={latestNews[currentIndex].title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  </div>}
                
                {/* News Content */}
                <div className="p-4 space-y-2">
                  {/* Category Badge */}
                  <span className="inline-block bg-gradient-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                    {latestNews[currentIndex]?.category}
                  </span>
                  
                  {/* Title */}
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                    {latestNews[currentIndex]?.title}
                  </h3>
                  
                  {/* Summary */}
                  <p className="text-foreground/80 text-xs line-clamp-2 leading-relaxed">
                    {latestNews[currentIndex]?.summary}
                  </p>
                  
                  {/* Date */}
                  <div className="flex items-center text-muted-foreground text-xs pt-1">
                    <Calendar className="h-3 w-3 ml-1" />
                    <span>
                      {formatDistanceToNow(new Date(latestNews[currentIndex]?.published_at), {
                    addSuffix: true,
                    locale: ar
                  })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {latestNews.length > 1 && <>
                <Button variant="ghost" size="sm" onClick={handlePrev} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white border-0" disabled={isAnimating}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleNext} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white border-0" disabled={isAnimating}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </>}
          </div>}

        {/* Indicators */}
        {latestNews.length > 1 && <div className="flex justify-center space-x-1 space-x-reverse mt-4">
            {latestNews.map((_, index) => <button key={index} onClick={() => {
          if (!isAnimating) {
            setIsAnimating(true);
            setTimeout(() => {
              setCurrentIndex(index);
              setIsAnimating(false);
            }, 150);
          }
        }} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/40'}`} />)}
          </div>}
      </div>

      {/* View All Button */}
      <div className="text-center mt-6">
        
      </div>
    </div>;
};