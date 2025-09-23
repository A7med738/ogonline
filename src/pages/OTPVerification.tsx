import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Clock, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OTPVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('pendingEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pendingEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/auth');
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the last filled input
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الرمز المكون من 6 أرقام",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpString,
        type: 'signup'
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "تم التأكيد بنجاح!",
          description: "مرحباً بك في تطبيق حدائق أكتوبر",
        });
        
        // Clear pending email
        localStorage.removeItem('pendingEmail');
        
        // Navigate to home
        navigate('/');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "خطأ في التأكيد",
        description: error.message || "الرمز غير صحيح أو منتهي الصلاحية",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!email) return;
    
    setResendLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        throw error;
      }

      toast({
        title: "تم إرسال رمز جديد",
        description: "تم إرسال رمز التأكيد الجديد إلى بريدك الإلكتروني",
      });

      // Reset timer
      setTimeLeft(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      // Focus first input
      inputRefs.current[0]?.focus();
      
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال الرمز الجديد",
        variant: "destructive"
      });
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                تأكيد البريد الإلكتروني
              </h1>
              <p className="text-gray-600 text-sm">
                تم إرسال رمز التأكيد إلى
              </p>
              <p className="text-green-600 font-semibold text-sm">
                {email}
              </p>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                أدخل الرمز المكون من 6 أرقام
              </label>
              
              <div className="flex justify-center space-x-2" dir="ltr">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-bold border-2 focus:border-green-500 focus:ring-green-500"
                    disabled={loading}
                    dir="ltr"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={verifyOTP}
              disabled={!isOtpComplete || loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 mb-4"
            >
              {loading ? (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق...</span>
                </div>
              ) : (
                'تأكيد الرمز'
              )}
            </Button>

            {/* Resend Section */}
            <div className="text-center">
              {canResend ? (
                <Button
                  variant="outline"
                  onClick={resendOTP}
                  disabled={resendLoading}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  {resendLoading ? (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الإرسال...</span>
                    </div>
                  ) : (
                    'إعادة إرسال الرمز'
                  )}
                </Button>
              ) : (
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    يمكنك إعادة الإرسال خلال {timeLeft} ثانية
                  </span>
                </div>
              )}
            </div>

            {/* Back Button */}
            <div className="mt-6 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse text-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لتسجيل الدخول</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-500">
            لم تستلم الرمز؟ تحقق من مجلد الرسائل المزعجة
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
