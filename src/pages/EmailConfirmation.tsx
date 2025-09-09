import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a subtle animation delay
    const card = document.querySelector('.confirmation-card');
    if (card) {
      card.classList.add('animate-in', 'fade-in-50', 'slide-in-from-bottom-4');
    }

    // Check if user is already confirmed
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsConfirmed(true);
          toast({
            title: "تم تأكيد حسابك بنجاح!",
            description: "مرحباً بك في تطبيق أكتوبر جاردنز أونلاين",
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [toast]);

  const handleReturnToApp = () => {
    // Check if running in mobile app
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
      // In mobile app, navigate to home
      navigate('/');
    } else {
      // In web browser, try to close or redirect
      if (window.opener) {
        window.close();
      } else {
        window.location.href = '/';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
        <GlassCard className="confirmation-card w-full max-w-md p-8 text-center space-y-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">جاري التحقق من حالة الحساب...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <GlassCard className="confirmation-card w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
            <CheckCircle className="w-16 h-16 text-primary relative z-10" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            {isConfirmed ? "تم تأكيد حسابك بنجاح!" : "يرجى تأكيد حسابك"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {isConfirmed 
              ? "مرحباً بك في تطبيق أكتوبر جاردنز أونلاين\nيمكنك الآن الاستمتاع بجميع خدماتنا"
              : "يرجى فحص بريدك الإلكتروني والنقر على رابط التفعيل"
            }
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={handleReturnToApp}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {isConfirmed ? "العودة إلى التطبيق" : "العودة إلى الصفحة الرئيسية"}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            {isConfirmed 
              ? "إذا لم يتم إغلاق هذه النافذة تلقائياً، يمكنك إغلاقها يدوياً"
              : "بعد تأكيد حسابك، يمكنك العودة إلى التطبيق"
            }
          </p>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            في حالة وجود أي مشاكل، يرجى التواصل مع فريق الدعم
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default EmailConfirmation;