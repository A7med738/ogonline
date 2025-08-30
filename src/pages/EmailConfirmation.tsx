import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

const EmailConfirmation = () => {
  useEffect(() => {
    // Add a subtle animation delay
    const card = document.querySelector('.confirmation-card');
    if (card) {
      card.classList.add('animate-in', 'fade-in-50', 'slide-in-from-bottom-4');
    }
  }, []);

  const handleReturnToApp = () => {
    // Close the current tab/window if possible, or redirect to app
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/';
    }
  };

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
            تم تأكيد حسابك بنجاح!
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            مرحباً بك في تطبيق أكتوبر جاردنز أونلاين
            <br />
            يمكنك الآن الاستمتاع بجميع خدماتنا
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={handleReturnToApp}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            العودة إلى التطبيق
          </Button>
          
          <p className="text-sm text-muted-foreground">
            إذا لم يتم إغلاق هذه النافذة تلقائياً، يمكنك إغلاقها يدوياً
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