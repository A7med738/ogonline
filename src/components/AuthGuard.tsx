import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Lock, User, ArrowRight, Shield } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showLoginPrompt?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback, 
  redirectTo = '/auth',
  showLoginPrompt = true 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // إذا كان في حالة تحميل، اعرض loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // إذا كان المستخدم مسجل دخول، اعرض المحتوى
  if (user) {
    return <>{children}</>;
  }

  // إذا كان هناك fallback مخصص، استخدمه
  if (fallback) {
    return <>{fallback}</>;
  }

  // إذا لم يكن مسجل دخول ولا يوجد fallback، اعرض رسالة تسجيل الدخول
  if (!showLoginPrompt) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            تسجيل الدخول مطلوب
          </h2>
          
          <p className="text-gray-600 mb-6">
            يجب عليك تسجيل الدخول للوصول إلى هذه الخدمة
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(redirectTo)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              تسجيل الدخول
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              العودة للرئيسية
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center text-blue-600 mb-2">
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">لماذا التسجيل مطلوب؟</span>
            </div>
            <p className="text-xs text-blue-600">
              نحمي خصوصيتك ونضمن جودة الخدمات المقدمة للمواطنين المسجلين
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AuthGuard;
