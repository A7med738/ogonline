import { ArrowRight, Calendar, Clock } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { NewsInteractions } from "@/components/NewsInteractions"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface NewsItem {
  id: string
  title: string
  summary: string
  content: string | null
  category: string
  published_at: string
  created_at: string
}

const News = () => {
  const navigate = useNavigate()
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })

      if (error) throw error
      setNewsData(data || [])
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-4">آخر أخبار المدينة</h1>
          <p className="text-white/80 text-lg">
            تابع أحدث الأخبار والمستجدات في مدينتك
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        {/* News Grid */}
        <div className="grid gap-6 max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="text-white/80 mt-2">جاري تحميل الأخبار...</p>
            </div>
          ) : newsData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/80">لا توجد أخبار متاحة حالياً</p>
            </div>
          ) : (
            newsData.map((news, index) => (
              <GlassCard 
                key={news.id} 
                className="animate-slide-up hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-4">
                  {/* Category Badge */}
                  <div className="flex justify-between items-start">
                    <span className="bg-gradient-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {news.category}
                    </span>
                    <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(news.published_at), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                    {news.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-foreground/90 leading-relaxed">
                    {news.summary}
                  </p>

                  {/* Read More */}
                  <div className="pt-2">
                    <Button variant="ghost" className="text-primary hover:text-primary/80 p-0">
                      اقرأ المزيد
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {/* News Interactions */}
                  <NewsInteractions newsId={news.id} />
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default News