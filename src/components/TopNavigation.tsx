import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, Menu, Search, ChevronDown, Home, Newspaper, Shield, Building, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
interface TopNavigationProps {
  isAdmin?: boolean;
}
export const TopNavigation: React.FC<TopNavigationProps> = ({
  isAdmin
}) => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [{
    icon: Home,
    label: 'الرئيسية',
    path: '/'
  }, {
    icon: Newspaper,
    label: 'أخبار المدينة',
    path: '/news'
  }, {
    icon: Shield,
    label: 'أرقام الشرطة',
    path: '/police'
  }, {
    icon: Building,
    label: 'جهاز المدينة',
    path: '/city'
  }, ...(user ? [{
    icon: User,
    label: 'الملف الشخصي',
    path: '/profile'
  }, ...(isAdmin ? [{
    icon: Settings,
    label: 'الإدارة',
    path: '/admin'
  }] : [])] : [{
    icon: User,
    label: 'تسجيل الدخول',
    path: '/auth'
  }])];
  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    navigate('/');
  };
  return <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 shadow-lg">
      {/* Status Bar Simulation */}
      

      {/* Main Navigation */}
      <div className="flex justify-between items-center px-4 py-3 bg-green-600 relative">
        <div className="flex items-center space-x-3">
          <Bell className="h-4 w-4 text-white" />
          
        </div>

        <div className="flex items-center space-x-2">
          <h1 className="text-white text-lg font-semibold">حدائق أكتوبر</h1>
          <ChevronDown className="h-4 w-4 text-white" />
        </div>

        <div className="relative">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-4 w-4" />
          </Button>

          {/* Dropdown Menu */}
          {isMenuOpen && <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-2">
                {menuItems.map(item => {
              const Icon = item.icon;
              return <button key={item.path} onClick={() => handleMenuItemClick(item.path)} className="w-full flex items-center px-4 py-3 text-right hover:bg-gray-50 transition-colors">
                      <Icon className="h-4 w-4 text-gray-600 ml-3" />
                      <span className="text-gray-800 font-medium">{item.label}</span>
                    </button>;
            })}
                
                {user && <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button onClick={handleSignOut} className="w-full flex items-center px-4 py-3 text-right hover:bg-gray-50 transition-colors text-red-600">
                      <LogOut className="h-4 w-4 ml-3" />
                      <span className="font-medium">تسجيل الخروج</span>
                    </button>
                  </>}
              </div>
            </div>}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3 bg-green-600">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="دور على إعلان أو مكان أو مطعم" className="w-full bg-white rounded-full py-2 pr-10 pl-4 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50" />
        </div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>}
    </div>;
};