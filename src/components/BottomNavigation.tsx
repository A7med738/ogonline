import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

interface BottomNavigationProps {
  isAdmin?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isVisible, toggle } = useSidebar();

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
    <>
      {/* Toggle Button */}
      <button
        onClick={toggle}
        className={`fixed top-4 z-50 p-2 rounded-lg bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-all duration-300 ${
          isVisible ? 'right-14' : 'right-2'
        }`}
        title={isVisible ? 'إخفاء الشريط' : 'إظهار الشريط'}
      >
        {isVisible ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full w-12 bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 shadow-lg">
          <div className="flex flex-col items-center justify-center h-full py-6 space-y-4">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.path}
                  onClick={item.onClick}
                  className={`relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/25 text-white shadow-md scale-105' 
                      : 'text-white/70 hover:text-white hover:bg-white/15 hover:scale-105'
                  }`}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0.5 h-6 bg-white rounded-full shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};