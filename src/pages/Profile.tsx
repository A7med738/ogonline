import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GlassCard } from '@/components/ui/glass-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowRight, User, Camera, LogOut, AlertCircle, Save } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileData {
  full_name: string
  age: number | null
  avatar_url: string | null
  job_title: string | null
  gender: string | null
  phone: string | null
  location_details: string | null
}

const Profile = () => {
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    age: null,
    avatar_url: null,
    job_title: null,
    gender: null,
    phone: null,
    location_details: null
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
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setProfileData(data)
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
          age: profileData.age,
          job_title: profileData.job_title,
          gender: profileData.gender,
          phone: profileData.phone,
          location_details: profileData.location_details
        })
        .eq('user_id', user?.id)

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
        .eq('user_id', user?.id)

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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleLogout}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <GlassCard className="mb-6 animate-scale-in">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={profileData.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                    {profileData.full_name ? profileData.full_name.charAt(0) : 'ن'}
                  </AvatarFallback>
                </Avatar>
                
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadLoading}
                  />
                </label>
                
                {uploadLoading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {profileData.full_name || 'الملف الشخصي'}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </GlassCard>

          {/* Important Notice */}
          <Alert className="mb-6 border-primary/20 bg-primary/10 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-primary">
              <strong>تنبيه مهم:</strong> تأكد من إدخال معلوماتك الشخصية بشكل صحيح ودقيق. هذه المعلومات ضرورية للحصول على أفضل خدمة من خدمات المدينة الذكية ولضمان وصول الخدمات إليك بنجاح.
            </AlertDescription>
          </Alert>

          {/* Profile Form */}
          <GlassCard className="animate-slide-up">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الثلاثي *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">العمر *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="16"
                    max="100"
                    value={profileData.age || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, age: parseInt(e.target.value) || null }))}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">المسمى الوظيفي</Label>
                  <Input
                    id="jobTitle"
                    type="text"
                    placeholder="مثال: مهندس برمجيات"
                    value={profileData.job_title || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">الجنس</Label>
                  <Select 
                    value={profileData.gender || ''} 
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ذكر">ذكر</SelectItem>
                      <SelectItem value="أنثى">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="مثال: 0501234567"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">تفاصيل الموقع</Label>
                  <Textarea
                    id="location"
                    placeholder="مثال: حي النخيل، شارع الأمير محمد، مجمع السكن رقم 123، الطابق الثاني"
                    value={profileData.location_details || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location_details: e.target.value }))}
                    className="text-right min-h-[100px]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300"
                disabled={loading}
              >
                <Save className="ml-2 h-4 w-4" />
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default Profile