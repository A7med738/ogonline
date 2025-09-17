import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface ProtectedNavItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  showLockIcon?: boolean;
}

const ProtectedNavItem: React.FC<ProtectedNavItemProps> = ({ 
  children, 
  onClick, 
  className = '',
  showLockIcon = true 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      // إذا كان مسجل دخول، نفذ الإجراء المطلوب
      if (onClick) {
        onClick();
      }
    } else {
      // إذا لم يكن مسجل دخول، اذهب لصفحة تسجيل الدخول
      navigate('/auth');
    }
  };

  return (
    <motion.div
      whileHover={{ scale: user ? 1.02 : 1 }}
      whileTap={{ scale: user ? 0.98 : 1 }}
      onClick={handleClick}
      className={`relative cursor-pointer ${className} ${
        !user ? 'opacity-75' : ''
      }`}
    >
      {children}
      
      {/* أيقونة القفل للمستخدمين غير المسجلين */}
      {!user && showLockIcon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 right-2"
        >
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <Lock className="w-3 h-3 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProtectedNavItem;
