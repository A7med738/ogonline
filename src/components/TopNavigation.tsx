import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, Menu, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface TopNavigationProps {
  isAdmin?: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ isAdmin }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 shadow-lg">
      {/* Status Bar Simulation */}
      <div className="flex justify-between items-center px-4 py-1 text-white text-sm bg-green-700">
        <div className="flex items-center space-x-2">
          <span className="text-xs">2:31</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-white rounded-sm"></div>
            <div className="w-1 h-3 bg-white rounded-sm"></div>
            <div className="w-1 h-3 bg-white rounded-sm"></div>
            <div className="w-1 h-3 bg-white rounded-sm"></div>
          </div>
          <div className="w-6 h-3 border border-white rounded-sm relative">
            <div className="w-3 h-1 bg-white rounded-sm absolute top-1 left-0.5"></div>
          </div>
          <span className="text-xs">52</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex justify-between items-center px-4 py-3 bg-green-600">
        <div className="flex items-center space-x-3">
          <Bell className="h-5 w-5 text-white" />
          <MessageCircle className="h-5 w-5 text-white" />
        </div>

        <div className="flex items-center space-x-2">
          <h1 className="text-white text-lg font-semibold">حدائق أكتوبر</h1>
          <ChevronDown className="h-4 w-4 text-white" />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2"
          onClick={() => {/* Menu logic can be added here */}}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3 bg-green-600">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="دور على إعلان أو مكان أو مطعم"
            className="w-full bg-white rounded-full py-2 pr-10 pl-4 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>
    </div>
  );
};