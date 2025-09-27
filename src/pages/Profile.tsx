import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowRight, User, Camera, LogOut, AlertCircle, Save, Settings, Bell, Mail, MapPin, Phone, Calendar, Briefcase, Building, Plus, Eye } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { EmailSubscription } from '@/components/EmailSubscription'
import { PushNotificationSettings } from '@/components/PushNotificationSettings'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProfileData {
  full_name: string
  phone: string | null
  gender: string | null
  date_of_birth: string | null
  avatar_url: string | null
  address: string | null
}

const Profile = () => {
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: null,
    gender: null,
    date_of_birth: null,
    avatar_url: null,
    address: null
  })
  
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    
    fetchProfile()
  }, [user, navigate])


  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, gender, date_of_birth, avatar_url, address')
        .eq('id', user?.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          phone: data.phone || null,
          gender: data.gender || null,
          date_of_birth: data.date_of_birth || null,
          avatar_url: data.avatar_url || null,
          address: data.address || null
        })
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          gender: profileData.gender,
          date_of_birth: profileData.date_of_birth,
          avatar_url: profileData.avatar_url,
          address: profileData.address
        })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: "تم تحديث الملف الشخصي بنجاح!",
        description: "تم حفظ جميع التغييرات"
      })
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadLoading(true)
      
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user?.id)

      if (updateError) throw updateError

      setProfileData(prev => ({ ...prev, avatar_url: data.publicUrl }))
      
      toast({
        title: "تم تحديث الصورة الشخصية!",
        description: "تم رفع وحفظ الصورة بنجاح"
      })
    } catch (error: any) {
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setUploadLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      navigate('/')
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً!"
      })
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  if (!user) return null

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-between items-center mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline"
              onClick={handleLogout}
              className="bg-white/70 backdrop-blur-sm border-white/30 hover:bg-white/90 shadow-lg"
            >
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </motion.div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              الملف الشخصي
            </h1>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Profile Header */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
                      <AvatarImage src={profileData.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-2xl">
                        {profileData.full_name ? profileData.full_name.charAt(0) : 'ن'}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  
                  <motion.label 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-emerald-500 to-cyan-500 p-2 rounded-full cursor-pointer hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg"
                  >
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadLoading}
                    />
                  </motion.label>
                  
                  {uploadLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </motion.div>
                  )}
                </div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2"
                >
                  {profileData.full_name || 'الملف الشخصي'}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Important Notice */}
          <motion.div variants={itemVariants}>
            <Alert className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 shadow-lg">
              <AlertCircle className="h-5 w-5 text-emerald-600" />
              <AlertDescription className="text-gray-700 text-sm font-medium leading-relaxed">
                <strong className="text-emerald-600">تنبيه مهم:</strong> تأكد من إدخال معلوماتك الشخصية بشكل صحيح ودقيق. هذه المعلومات ضرورية للحصول على أفضل خدمة من خدمات المدينة الذكية ولضمان وصول الخدمات إليك بنجاح.
              </AlertDescription>
            </Alert>
          </motion.div>


          {/* Notification Settings */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Bell className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">إعدادات الإشعارات</h2>
            </div>
            <div className="space-y-4">
              <EmailSubscription />
              <PushNotificationSettings />
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">المعلومات الشخصية</h2>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* الاسم الكامل */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 flex items-center space-x-2 rtl:space-x-reverse">
                        <User className="w-4 h-4" />
                        <span>الاسم الكامل *</span>
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        required
                        className="text-right bg-white/70 backdrop-blur-sm border-white/30 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </motion.div>

                    {/* رقم الهاتف */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center space-x-2 rtl:space-x-reverse">
                        <Phone className="w-4 h-4" />
                        <span>رقم الهاتف</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="مثال: 0501234567"
                        value={profileData.phone || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="text-right bg-white/70 backdrop-blur-sm border-white/30 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      />
                    </motion.div>

                    {/* الجنس */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-700 flex items-center space-x-2 rtl:space-x-reverse">
                        <User className="w-4 h-4" />
                        <span>الجنس</span>
                      </Label>
                      <Select 
                        value={profileData.gender || ''} 
                        onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger className="bg-white/70 backdrop-blur-sm border-white/30 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500">
                          <SelectValue placeholder="اختر الجنس" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ذكر">ذكر</SelectItem>
                          <SelectItem value="أنثى">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* تاريخ الميلاد */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700 flex items-center space-x-2 rtl:space-x-reverse">
                        <Calendar className="w-4 h-4" />
                        <span>تاريخ الميلاد</span>
                      </Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={profileData.date_of_birth || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value || null }))}
                        className="text-right bg-white/70 backdrop-blur-sm border-white/30 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        placeholder="اختر تاريخ ميلادك"
                      />
                    </motion.div>

                    {/* العنوان التفصيلي */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="space-y-2 md:col-span-2"
                    >
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center space-x-2 rtl:space-x-reverse">
                        <MapPin className="w-4 h-4" />
                        <span>العنوان التفصيلي</span>
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="مثال: حي النخيل، شارع الأمير محمد، مجمع السكن رقم 123، الطابق الثاني"
                        value={profileData.address || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        className="text-right min-h-[100px] bg-white/70 backdrop-blur-sm border-white/30 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      />
                    </motion.div>
                  </div>

                  {/* قسم رفع الصورة الشخصية */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">الصورة الشخصية</h3>
                    </div>
                    
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <Avatar className="w-20 h-20 border-4 border-blue-200 shadow-lg">
                        <AvatarImage src={profileData.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl">
                          {profileData.full_name ? profileData.full_name.charAt(0) : 'ن'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <label
                          htmlFor="avatar-upload"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors duration-200"
                        >
                          <Camera className="w-4 h-4 ml-2" />
                          {uploadLoading ? 'جاري الرفع...' : 'اختر صورة'}
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={uploadLoading}
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          PNG, JPG, GIF حتى 5MB
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3"
                      disabled={loading}
                    >
                      <Save className="ml-2 h-4 w-4" />
                      {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}

export default Profile