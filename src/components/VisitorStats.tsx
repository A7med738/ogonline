import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const VisitorStats = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تحميل عدد الزوار من localStorage
    const storedCount = localStorage.getItem('visitorCount');
    const count = storedCount ? parseInt(storedCount) : 0;
    
    // زيادة العداد بمقدار 1 مع كل زيارة
    const newCount = count + 1;
    setVisitorCount(newCount);
    
    // حفظ العدد الجديد
    localStorage.setItem('visitorCount', newCount.toString());
    
    // إنهاء التحميل
    setTimeout(() => setIsLoading(false), 500);
  }, []);

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
      className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 sm:p-4 text-white shadow-xl"
    >
      <div className="text-center">
        <h2 className="text-base sm:text-lg font-bold mb-3 text-white">
          عدد الزائرين:
        </h2>
        
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
                    scale: 1 
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
