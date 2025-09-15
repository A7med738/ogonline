import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  ArrowRight, 
  Star, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2,
  Bed,
  Bath,
  Square,
  Calendar,
  Phone,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RealEstateItem {
  id: string;
  title: string;
  type: 'sale' | 'rent' | 'land' | 'commercial' | 'office' | 'villa';
  price: string;
  location: string;
  area: string;
  bedrooms?: number;
  bathrooms?: number;
  image: string;
  featured: boolean;
  rating: number;
  views: number;
  likes: number;
  description?: string;
  yearBuilt?: number;
  parking?: number;
  furnished?: boolean;
}

interface RealEstateCardProps {
  item: RealEstateItem;
  viewMode: 'grid' | 'list';
  onViewDetails: (id: string) => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onContact: (id: string) => void;
}

export const RealEstateCard: React.FC<RealEstateCardProps> = ({
  item,
  viewMode,
  onViewDetails,
  onLike,
  onShare,
  onContact
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(item.id);
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.3 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: { duration: 0.2 }
    }
  };

  const detailsVariants = {
    hidden: { 
      height: 0,
      opacity: 0
    },
    visible: { 
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.05, y: -10 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="group"
      >
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row">
            {/* Image Section - Mobile Optimized */}
            <div className="relative w-full h-48 sm:w-64 sm:h-48 overflow-hidden">
              <motion.div
                variants={imageVariants}
                className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {item.title.charAt(0)}
                  </span>
                </div>
              </motion.div>
              
              {item.featured && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                    <Star className="w-3 h-3 ml-1" />
                    مميز
                  </Badge>
                </motion.div>
              )}

              <motion.div
                variants={overlayVariants}
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4"
              >
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={handleLike}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => onShare(item.id)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Content Section - Mobile Optimized */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                <div className="flex-1 mb-3 sm:mb-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 ml-1 flex-shrink-0" />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>
                </div>
                <div className="text-right sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">
                    {item.price}
                    <span className="text-xs sm:text-sm text-gray-500">
                      {item.type === 'rent' ? ' ريال/شهر' : ' ريال'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <Star className="w-4 h-4 text-yellow-400 ml-1" />
                    <span className="font-medium text-sm">{item.rating}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4 space-y-2 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 rtl:gap-reverse">
                  <span className="flex items-center text-xs sm:text-sm">
                    <Square className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    {item.area}
                  </span>
                  {item.bedrooms && (
                    <span className="flex items-center text-xs sm:text-sm">
                      <Bed className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      {item.bedrooms} غرف
                    </span>
                  )}
                  {item.bathrooms && (
                    <span className="flex items-center text-xs sm:text-sm">
                      <Bath className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      {item.bathrooms} حمام
                    </span>
                  )}
                  {item.parking && (
                    <span className="flex items-center text-xs sm:text-sm">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      {item.parking} موقف
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    {item.views}
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    {item.likes}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onContact(item.id)}
                    className="flex items-center text-xs sm:text-sm px-3 py-2"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    <span className="hidden sm:inline">اتصل</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onContact(item.id)}
                    className="flex items-center text-xs sm:text-sm px-3 py-2"
                  >
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    <span className="hidden sm:inline">رسالة</span>
                  </Button>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg text-sm"
                    size="sm"
                    onClick={() => onViewDetails(item.id)}
                  >
                    عرض التفاصيل
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
        {item.featured && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 z-10"
          >
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
              <Star className="w-3 h-3 ml-1" />
              مميز
            </Badge>
          </motion.div>
        )}

        <div className="relative overflow-hidden">
          <motion.div 
            variants={imageVariants}
            className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {item.title.charAt(0)}
              </span>
            </div>
          </motion.div>
          
          <motion.div
            variants={overlayVariants}
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4"
          >
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={() => onShare(item.id)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
            <div className="flex-1 mb-2 sm:mb-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
                {item.title}
              </h3>
              <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 ml-1 flex-shrink-0" />
                <span className="line-clamp-1">{item.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                {item.price}
                <span className="text-xs sm:text-sm text-gray-500">
                  {item.type === 'rent' ? ' ريال/شهر' : ' ريال'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 mb-4 space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 rtl:gap-reverse">
              <span className="flex items-center">
                <Square className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                {item.area}
              </span>
              {item.bedrooms && (
                <span className="flex items-center">
                  <Bed className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  {item.bedrooms}
                </span>
              )}
              {item.bathrooms && (
                <span className="flex items-center">
                  <Bath className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  {item.bathrooms}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 ml-1" />
              <span className="font-medium text-xs sm:text-sm">{item.rating}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse text-xs sm:text-sm text-gray-500">
              <span className="flex items-center">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                {item.views}
              </span>
              <span className="flex items-center">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                {item.likes}
              </span>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg text-sm"
                size="sm"
                onClick={() => onViewDetails(item.id)}
              >
                عرض المزيد
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RealEstateCard;
