import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// For now, we'll use static announcements. In the future, this can be connected to a database table
const SAMPLE_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'إشعار مهم: انقطاع مياه مجدول',
    message: 'سيتم قطع المياه غداً من الساعة 9 صباحاً حتى 3 عصراً لأعمال الصيانة الدورية',
    type: 'warning' as const,
    isActive: true
  },
  {
    id: '2', 
    title: 'تحويلة مرورية مؤقتة',
    message: 'تحويلة مرورية في شارع الرئيسي بسبب أعمال الإصلاح، يرجى استخدام الطرق البديلة',
    type: 'info' as const,
    isActive: true
  }
];

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'emergency';
  isActive: boolean;
}

export const AnnouncementsBar = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Filter active announcements
    const activeAnnouncements = SAMPLE_ANNOUNCEMENTS.filter(ann => ann.isActive);
    setAnnouncements(activeAnnouncements);
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000); // Change announcement every 5 seconds

      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  if (!isVisible || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];
  
  const getAnnouncementStyles = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-gradient-to-r from-red-600/90 to-red-700/90 border-red-500/20';
      case 'warning':
        return 'bg-gradient-to-r from-amber-600/90 to-amber-700/90 border-amber-500/20';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-600/90 to-blue-700/90 border-blue-500/20';
    }
  };

  return (
    <div className="w-full animate-slide-down">
      <div className={`${getAnnouncementStyles(currentAnnouncement.type)} border backdrop-blur-md text-white relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"></div>
        </div>
        
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse flex-1">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm md:text-base mb-1">
                  {currentAnnouncement.title}
                </h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  {currentAnnouncement.message}
                </p>
              </div>
            </div>

            {/* Indicators and Close Button */}
            <div className="flex items-center space-x-3 space-x-reverse flex-shrink-0">
              {/* Indicators for multiple announcements */}
              {announcements.length > 1 && (
                <div className="flex space-x-1 space-x-reverse">
                  {announcements.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};