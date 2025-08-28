import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/ui/glass-card'
import { ArrowRight, User, Mail, Calendar, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location])

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (isSignUp) {
      if (!formData.fullName.trim()) {
        newErrors.push('يرجى إدخال الاسم الثلاثي')
      } else if (formData.fullName.trim().split(' ').length < 3) {
        newErrors.push('يرجى إدخال الاسم الثلاثي كاملاً')
      }
      
      if (!formData.age || parseInt(formData.age) < 16 || parseInt(formData.age) > 100) {
        newErrors.push('يرجى إدخال عمر صحيح (16-100 سنة)')
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.push('كلمات المرور غير متطابقة')
      }
    }
    
    if (!formData.email.includes('@')) {
      newErrors.push('يرجى إدخال بريد إلكتروني صحيح')
    }
    
    if (formData.password.length < 6) {
      newErrors.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
              age: parseInt(formData.age)
            }
          }
        })
        
        if (error) throw error
        
        toast({
          title: "تم إنشاء الحساب بنجاح!",
          description: "يرجى فحص بريدك الإلكتروني والنقر على رابط التفعيل"
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (error) throw error
        
        toast({
          title: "تم تسجيل الدخول بنجاح!",
          description: "مرحباً بك في مركز المدينة"
        })
      }
    } catch (error: any) {
      let message = 'حدث خطأ غير متوقع'
      
      if (error.message.includes('Invalid login credentials')) {
        message = 'بيانات الدخول غير صحيحة'
      } else if (error.message.includes('User already registered')) {
        message = 'هذا البريد الإلكتروني مسجل مسبقاً'
      } else if (error.message.includes('Email not confirmed')) {
        message = 'يرجى تفعيل حسابك من خلال الرابط المرسل إلى بريدك الإلكتروني'
      }
      
      toast({
        title: "خطأ في العملية",
        description: message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors([]) // Clear errors when user starts typing
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
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

        {/* Auth Form */}
        <div className="max-w-md mx-auto">
          <GlassCard className="animate-scale-in">
            <div className="text-center mb-6">
              <div className="bg-gradient-primary p-3 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp ? 'انضم إلى مجتمع مدينتك' : 'ادخل إلى حسابك'}
              </p>
            </div>

            {/* Important Notice for Sign Up */}
            {isSignUp && (
              <Alert className="mb-6 border-primary/20 bg-primary/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-primary">
                  <strong>ملاحظة هامة:</strong> يرجى كتابة المعلومات بدقة وصحة تامة لتتمكن من الاستفادة من جميع خدمات المدينة على أكمل وجه.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert className="mb-6 border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-destructive">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center space-x-2 space-x-reverse">
                      <User className="h-4 w-4" />
                      <span>الاسم الثلاثي *</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="مثال: أحمد محمد علي"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="h-4 w-4" />
                      <span>العمر *</span>
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="مثال: 25"
                      min="16"
                      max="100"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2 space-x-reverse">
                  <Mail className="h-4 w-4" />
                  <span>البريد الإلكتروني *</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="text-left"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="كلمة المرور (6 أحرف على الأقل)"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="text-right"
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="أعد كتابة كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    className="text-right"
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'جاري المعالجة...' : (isSignUp ? 'إنشاء الحساب' : 'تسجيل الدخول')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setErrors([])
                  setFormData({
                    fullName: '',
                    email: formData.email, // Keep email
                    password: '',
                    confirmPassword: '',
                    age: ''
                  })
                }}
                className="text-primary hover:text-primary/80"
              >
                {isSignUp ? 'لديك حساب؟ سجل الدخول' : 'لا تملك حساب؟ أنشئ حساباً جديداً'}
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default Auth