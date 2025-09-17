import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck, TrendingUp, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const VisitorStats = () => {
  const [stats, setStats] = useState({
    verifiedUsers: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const verifiedUsersRes = await supabase.rpc('get_verified_users_count');

      setStats({
        verifiedUsers: verifiedUsersRes.data || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error loading visitor stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 sm:p-4 text-white">
        <div className="animate-pulse">
          <div className="h-3 bg-white/20 rounded w-1/3 mb-2"></div>
          <div className="flex justify-center">
            <div className="h-10 w-24 bg-white/20 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 sm:p-4 text-white shadow-xl"
    >
      <div className="text-center mb-3">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full mb-2"
        >
          <Globe className="w-5 h-5 text-white" />
        </motion.div>
        <h2 className="text-base sm:text-lg font-bold mb-1">إحصائيات الزائرين</h2>
      </div>

      <div className="flex justify-center">
        {/* Verified Users */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-md p-3 sm:p-4 text-center hover:bg-white/15 transition-all duration-300 max-w-48 w-full"
        >
          <div className="flex items-center justify-center mb-2">
            <UserCheck className="w-5 h-5 text-green-200 mr-1.5" />
            <span className="text-xs sm:text-sm font-medium text-green-100">المستخدمون الموثقون</span>
          </div>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-2xl sm:text-3xl font-bold text-white mb-1"
          >
            {stats.verifiedUsers.toLocaleString('ar-EG')}
          </motion.div>
          <p className="text-xs text-green-200">مستخدم موثق</p>
        </motion.div>
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-3 text-center"
      >
        <div className="inline-flex items-center text-xs text-blue-100 bg-white/10 rounded-full px-2 py-1">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span>نمو مستمر</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VisitorStats;
