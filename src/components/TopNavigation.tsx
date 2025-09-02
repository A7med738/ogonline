import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, MessageCircle, Menu, Search, ChevronDown, Home, Newspaper, Shield, Building, User, Settings, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NewsNotificationBadge } from '@/components/NewsNotificationBadge';
import { useNewsNotifications } from '@/hooks/useNewsNotifications';
import { supabase } from '@/integrations/supabase/client';
interface TopNavigationProps {
  isAdmin?: boolean;
}
export const TopNavigation: React.FC<TopNavigationProps> = ({
  isAdmin
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount, markNewsAsRead } = useNewsNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    news: any[];
    stations: any[];
    departments: any[];
  }>({ news: [], stations: [], departments: [] });
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
    label: 'شرطة المدينة',
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

  // Fetch recent news when user is logged in
  useEffect(() => {
    const fetchRecentNews = async () => {
      if (!user) return;
      
      const { data: news } = await supabase
        .from('news')
        .select('id, title, published_at')
        .order('published_at', { ascending: false })
        .limit(5);
      
      setRecentNews(news || []);
    };

    fetchRecentNews();
  }, [user]);

  const handleNewsClick = () => {
    if (user) {
      markNewsAsRead();
      navigate('/news');
      setIsNewsOpen(false);
    } else {
      navigate('/auth');
    }
  };

  // Debounced global search across multiple tables
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults({ news: [], stations: [], departments: [] });
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const handle = setTimeout(async () => {
      try {
        const [newsResp, stationsResp, depsResp] = await Promise.all([
          supabase
            .from('news')
            .select('id, title, summary, category, published_at')
            .or(`title.ilike.%${q}%,summary.ilike.%${q}%,content.ilike.%${q}%`)
            .order('published_at', { ascending: false })
            .limit(5),
          supabase
            .from('police_stations')
            .select('id, name, area, address, description')
            .or(`name.ilike.%${q}%,area.ilike.%${q}%,address.ilike.%${q}%,description.ilike.%${q}%`)
            .limit(5),
          supabase
            .from('city_departments')
            .select('id, title, description, phone, email, hours')
            .or(`title.ilike.%${q}%,description.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`)
            .limit(5),
        ]);

        setSearchResults({
          news: newsResp.data || [],
          stations: stationsResp.data || [],
          departments: depsResp.data || [],
        });
        setSearchOpen(true);
      } catch (e) {
        setSearchResults({ news: [], stations: [], departments: [] });
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const closeSearch = () => setSearchOpen(false);
  return <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 shadow-lg">
      {/* Status Bar Simulation */}
      

      {/* Main Navigation */}
      <div className="flex justify-between items-center px-4 py-3 bg-green-600 relative">
        <div className="flex items-center space-x-3">
          {location.pathname !== '/' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 p-2" 
              onClick={() => navigate('/')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          <Popover open={isNewsOpen} onOpenChange={setIsNewsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2 relative">
                <Bell className="h-4 w-4 text-white" />
                {user && unreadCount > 0 && (
                  <NewsNotificationBadge count={unreadCount} />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-3">الأخبار الجديدة</h3>
                {!user ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">يرجى تسجيل الدخول لرؤية الأخبار</p>
                    <Button onClick={() => navigate('/auth')} className="w-full">
                      تسجيل الدخول
                    </Button>
                  </div>
                ) : recentNews.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600">لا توجد أخبار جديدة</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {recentNews.map((news) => (
                      <div
                        key={news.id}
                        className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border"
                        onClick={handleNewsClick}
                      >
                        <h4 className="font-medium text-sm text-right">{news.title}</h4>
                        <p className="text-xs text-gray-500 text-right mt-1">
                          {new Date(news.published_at).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    ))}
                    <div className="pt-3 border-t">
                      <Button onClick={handleNewsClick} className="w-full" variant="outline">
                        عرض جميع الأخبار
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
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
          <input
            type="text"
            placeholder=" ابحث هن أي شيء "
            className="w-full bg-white rounded-full py-1 pr-10 pl-4 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setSearchOpen(true)}
          />

          {searchOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border z-50">
              <div className="p-2 max-h-96 overflow-auto">
                {isSearching && <div className="text-center text-sm text-gray-500 py-4">جارٍ البحث...</div>}

                {!isSearching && (
                  <>
                    {searchResults.news.length > 0 && (
                      <div className="mb-3">
                        <div className="px-2 py-1 text-xs text-gray-500">الأخبار</div>
                        <ul>
                          {searchResults.news.map((n: any) => (
                            <li key={n.id}>
                              <button
                                className="w-full text-right px-3 py-2 hover:bg-gray-50 rounded-lg"
                                onClick={() => { navigate('/news'); closeSearch(); setIsMenuOpen(false); }}
                              >
                                <div className="text-sm font-medium line-clamp-1">{n.title}</div>
                                {n.summary && <div className="text-xs text-gray-500 line-clamp-1">{n.summary}</div>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {searchResults.stations.length > 0 && (
                      <div className="mb-3">
                        <div className="px-2 py-1 text-xs text-gray-500">أقسام الشرطة</div>
                        <ul>
                          {searchResults.stations.map((s: any) => (
                            <li key={s.id}>
                              <button
                                className="w-full text-right px-3 py-2 hover:bg-gray-50 rounded-lg"
                                onClick={() => { navigate('/police'); closeSearch(); setIsMenuOpen(false); }}
                              >
                                <div className="text-sm font-medium line-clamp-1">{s.name} - {s.area}</div>
                                {s.address && <div className="text-xs text-gray-500 line-clamp-1">{s.address}</div>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {searchResults.departments.length > 0 && (
                      <div className="mb-1">
                        <div className="px-2 py-1 text-xs text-gray-500">إدارات المدينة</div>
                        <ul>
                          {searchResults.departments.map((d: any) => (
                            <li key={d.id}>
                              <button
                                className="w-full text-right px-3 py-2 hover:bg-gray-50 rounded-lg"
                                onClick={() => { navigate('/city'); closeSearch(); setIsMenuOpen(false); }}
                              >
                                <div className="text-sm font-medium line-clamp-1">{d.title}</div>
                                {d.description && <div className="text-xs text-gray-500 line-clamp-1">{d.description}</div>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {searchResults.news.length === 0 && searchResults.stations.length === 0 && searchResults.departments.length === 0 && (
                      <div className="text-center text-sm text-gray-500 py-6">لا توجد نتائج</div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t p-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={closeSearch}>إغلاق</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>}
    </div>;
};