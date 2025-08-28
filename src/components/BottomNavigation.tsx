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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={item.onClick}
                className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-white bg-white/20 shadow-lg scale-105' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};