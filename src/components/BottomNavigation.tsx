import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BottomNavigationProps {
  isAdmin?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    {
      icon: Home,
      label: 'الرئيسية',
      path: '/',
      onClick: () => navigate('/')
    },
    ...(user ? [
      {
        icon: User,
        label: 'الملف الشخصي',
        path: '/profile',
        onClick: () => navigate('/profile')
      },
      ...(isAdmin ? [{
        icon: Settings,
        label: 'الإدارة',
        path: '/admin',
        onClick: () => navigate('/admin')
      }] : [])
    ] : [{
      icon: User,
      label: 'تسجيل الدخول',
      path: '/auth',
      onClick: () => navigate('/auth')
    }])
  ];

  return (
    <div className="fixed top-0 right-0 h-full z-50 w-20 md:w-24">
      <div className="h-full bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 shadow-2xl">
        <div className="flex flex-col items-center justify-center h-full py-8 space-y-6">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={item.onClick}
                className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg scale-110 border border-white/30' 
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105'
                }`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6 md:h-7 md:w-7" />
                  {isActive && (
                    <div className="absolute -inset-1 bg-white/20 rounded-lg blur-sm -z-10" />
                  )}
                </div>
                <span className="text-xs font-medium mt-1 text-center leading-tight max-w-12">
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full shadow-lg" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};