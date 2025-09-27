import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Home, Building, ArrowLeft, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { Alert, AlertDescription } from '@/components/ui/alert'

const RealEstate = () => {
  const navigate = useNavigate()
  const [loading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Button>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">عقار ماب المدينة</h1>
          </motion.div>
        </motion.div>

        {/* Coming Soon Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>قريباً!</strong> خدمة عقار ماب المدينة قيد التطوير. ستتمكن قريباً من استكشاف العقارات المتاحة في المدينة.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Feature Cards */}
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full w-fit mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">عقارات سكنية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                استكشف الشقق والفلل والمنازل المتاحة للبيع أو الإيجار
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-fit mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">عقارات تجارية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                مكاتب ومحلات ومستودعات للاستثمار التجاري
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-800">خرائط تفاعلية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                خرائط تفاعلية لاستكشاف مواقع العقارات
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">كن أول من يعرف</h2>
              <p className="text-lg mb-6 opacity-90">
                سجل بريدك الإلكتروني لتكون أول من يعرف عند إطلاق خدمة عقار ماب المدينة
              </p>
              <Button 
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-gray-100"
                disabled
              >
                سجل اهتمامك
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default RealEstate
