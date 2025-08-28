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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      
      // Check if running in a Capacitor mobile app
      const isCapacitor = typeof window !== 'undefined' && 
                         window.Capacitor?.isNativePlatform?.() === true
      const redirectTo = isCapacitor 
        ? 'app.lovable.3e2213cabd164ff28f6945d0069c6783://auth/callback'
        : `${window.location.origin}/`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive"
      })
      setLoading(false)
    }
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

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-border"></div>
              <span className="mx-4 text-muted-foreground text-sm">أو</span>
              <div className="flex-1 border-t border-border"></div>
            </div>

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full border-border bg-background hover:bg-accent"
              disabled={loading}
            >
              <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isSignUp ? 'إنشاء حساب بـ Google' : 'تسجيل الدخول بـ Google'}
            </Button>

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