import { ArrowRight, Calendar, Clock } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"

const newsData = [
  {
    id: 1,
    title: "افتتاح مشروع تطوير الحديقة المركزية",
    summary: "تم افتتاح مشروع تطوير الحديقة المركزية بتكلفة 5 ملايين ريال لتوفير مساحات خضراء أكثر للمواطنين",
    date: "2024-01-15",
    time: "10:30",
    category: "تطوير"
  },
  {
    id: 2,
    title: "حملة تنظيف الشوارع الرئيسية",
    summary: "انطلاق حملة شاملة لتنظيف وتجميل الشوارع الرئيسية بمشاركة المواطنين والجهات المختصة",
    date: "2024-01-14",
    time: "08:00",
    category: "بيئة"
  },
  {
    id: 3,
    title: "تحديث أنظمة الإضاءة العامة",
    summary: "تركيب أنظمة إضاءة LED موفرة للطاقة في جميع أحياء المدينة لتحسين الرؤية والأمان",
    date: "2024-01-13",
    time: "14:15",
    category: "بنية تحتية"
  },
  {
    id: 4,
    title: "برنامج دعم المشاريع الصغيرة",
    summary: "إطلاق برنامج جديد لدعم وتمويل المشاريع الصغيرة والمتوسطة لتعزيز الاقتصاد المحلي",
    date: "2024-01-12",
    time: "16:45",
    category: "اقتصاد"
  }
]

const News = () => {
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
            onClick={() => window.history.back()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        {/* News Grid */}
        <div className="grid gap-6 max-w-4xl mx-auto">
          {newsData.map((news, index) => (
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
                    <span>{news.date}</span>
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{news.time}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                  {news.title}
                </h2>

                {/* Summary */}
                <p className="text-muted-foreground leading-relaxed">
                  {news.summary}
                </p>

                {/* Read More */}
                <div className="pt-2">
                  <Button variant="ghost" className="text-primary hover:text-primary/80 p-0">
                    اقرأ المزيد
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}

export default News