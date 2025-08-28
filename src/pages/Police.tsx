import { Phone, MapPin, Clock, ArrowRight, Shield } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const policeData = [
  {
    id: 1,
    title: "رقم الطوارئ",
    number: "999",
    description: "للحالات الطارئة فقط - متاح 24/7",
    type: "emergency",
    available: "متاح على مدار الساعة"
  },
  {
    id: 2,
    title: "المركز الرئيسي",
    number: "011-456-7890",
    description: "للاستفسارات العامة والخدمات الإدارية",
    type: "main",
    available: "السبت - الخميس: 8:00 - 17:00"
  },
  {
    id: 3,
    title: "قسم المرور",
    number: "011-456-7891",
    description: "مخالفات المرور وحوادث السير",
    type: "traffic",
    available: "السبت - الخميس: 8:00 - 20:00"
  },
  {
    id: 4,
    title: "الأمن العام",
    number: "011-456-7892",
    description: "للبلاغات والشكاوى الأمنية",
    type: "security",
    available: "متاح على مدار الساعة"
  },
  {
    id: 5,
    title: "وحدة الأحداث",
    number: "011-456-7893",
    description: "للقضايا المتعلقة بالأحداث",
    type: "juvenile",
    available: "السبت - الخميس: 8:00 - 16:00"
  }
]

const Police = () => {
  const navigate = useNavigate()
  
  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self')
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">أرقام الشرطة</h1>
          <p className="text-white/80 text-lg">
            أرقام التواصل مع مركز الشرطة للطوارئ والخدمات
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

        {/* Emergency Banner */}
        <GlassCard className="mb-8 bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-400/30 animate-scale-in">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">في حالة الطوارئ</h2>
            <p className="text-white/90 mb-4">اتصل فوراً على الرقم المجاني</p>
            <Button 
              size="lg"
              onClick={() => handleCall('999')}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xl px-8 py-4 shadow-elegant"
            >
              <Phone className="ml-2 h-6 w-6" />
              999
            </Button>
          </div>
        </GlassCard>

        {/* Police Numbers Grid */}
        <div className="grid gap-6 max-w-4xl mx-auto">
          {policeData.slice(1).map((contact, index) => (
            <GlassCard 
              key={contact.id} 
              className="animate-slide-up hover:scale-[1.02] transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {contact.title}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {contact.description}
                  </p>
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{contact.available}</span>
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {contact.number}
                  </div>
                  <Button 
                    onClick={() => handleCall(contact.number)}
                    className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
                  >
                    <Phone className="ml-2 h-4 w-4" />
                    اتصال
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Location Info */}
        <GlassCard className="mt-8 max-w-4xl mx-auto animate-fade-in">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">موقع المركز الرئيسي</h3>
            <p className="text-muted-foreground">
              شارع الملك فهد - حي الوزارات - صندوق بريد 1234
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default Police