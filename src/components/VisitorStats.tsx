import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const VisitorStats = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewVisitor, setIsNewVisitor] = useState(false);

  useEffect(() => {
    // تحميل العداد الحالي وزيادته
    loadAndIncrementCounter();
    
    // الاشتراك في التحديثات المباشرة
    const subscription = supabase
      .channel('visitor_counter_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'visitor_counter',
          filter: 'id=eq.1'
        },
        (payload) => {
          console.log('Counter updated:', payload);
          const newCount = payload.new.counter_value;
          setVisitorCount(newCount);
          setIsNewVisitor(true);
          
          // إخفاء تأثير الزائر الجديد بعد 3 ثوان
          setTimeout(() => setIsNewVisitor(false), 3000);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadAndIncrementCounter = async () => {
    try {
      // أولاً: تحميل العداد الحالي
      const { data: currentData, error: currentError } = await supabase.rpc('get_visitor_counter');
      
      if (currentError) {
        console.error('Error getting current counter:', currentError);
        // في حالة الخطأ، استخدم localStorage كبديل
        const storedCount = localStorage.getItem('visitorCount');
        const count = storedCount ? parseInt(storedCount) : 0;
        const newCount = count + 1;
        setVisitorCount(newCount);
        localStorage.setItem('visitorCount', newCount.toString());
      } else {
        setVisitorCount(currentData || 0);
        
        // ثانياً: زيادة العداد
        const { data: incrementData, error: incrementError } = await supabase.rpc('increment_visitor_counter');
        
        if (incrementError) {
          console.error('Error incrementing counter:', incrementError);
        } else {
          // العداد سيتم تحديثه عبر Realtime subscription
          console.log('Counter incremented to:', incrementData);
        }
      }
    } catch (error) {
      console.error('Error in counter operations:', error);
      // في حالة الخطأ، استخدم localStorage كبديل
      const storedCount = localStorage.getItem('visitorCount');
      const count = storedCount ? parseInt(storedCount) : 0;
      const newCount = count + 1;
      setVisitorCount(newCount);
      localStorage.setItem('visitorCount', newCount.toString());
    } finally {
      setIsLoading(false);
    }
  };

  // تحويل الرقم إلى مصفوفة من الأرقام مع الصفر البادئ (7 خانات)
  const formatNumber = (num: number): string[] => {
    return num.toString().padStart(7, '0').split('');
  };

  const digits = formatNumber(visitorCount).reverse();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 sm:p-4 text-white shadow-xl">
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold mb-3">عدد الزائرين:</h2>
          <div className="flex justify-center space-x-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="w-8 h-12 bg-white/20 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 sm:p-4 text-white shadow-xl ${
        isNewVisitor ? 'ring-4 ring-green-300 ring-opacity-50' : ''
      }`}
    >
      <div className="text-center">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white">
          عدد الزائرين:
        </h2>
        
        {/* إشعار زائر جديد */}
        {isNewVisitor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-2"
          >
            <div className="inline-flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mr-2"
              >
                🎉
              </motion.span>
              زائر جديد!
            </div>
          </motion.div>
        )}
        
        <div className="flex justify-center space-x-1">
          {digits.map((digit, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 200
              }}
              className="relative"
            >
              <div className="w-8 h-12 bg-gradient-to-b from-green-800 to-green-600 rounded-md border-2 border-green-700 shadow-inner flex items-center justify-center relative overflow-hidden">
                {/* خلفية ديجيتال */}
                <div className="absolute inset-0 bg-gradient-to-b from-green-400/20 to-green-600/20"></div>
                
                {/* الرقم */}
                <motion.span
                  key={`${digit}-${visitorCount}`}
                  initial={{ y: 20, opacity: 0, scale: 0.8 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1, 
                    scale: isNewVisitor ? 1.1 : 1 
                  }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="relative z-10 text-xl font-bold text-white font-mono"
                  style={{
                    textShadow: '0 0 10px rgba(0,0,0,0.3)',
                    fontFamily: 'Courier New, monospace'
                  }}
                >
                  {digit}
                </motion.span>
                
                {/* تأثير الإضاءة */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default VisitorStats;
