import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  MapPin, 
  Square, 
  Bed, 
  Bath,
  Heart,
  Eye,
  ArrowRight
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
}

interface RealEstateCarouselProps {
  items: RealEstateItem[];
  title: string;
  subtitle?: string;
  onItemClick: (id: string) => void;
  onLike: (id: string) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const RealEstateCarousel: React.FC<RealEstateCarouselProps> = ({
  items,
  title,
  subtitle,
  onItemClick,
  onLike,
  autoPlay = true,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState<Set<string>>(new Set());

  const itemsPerView = 3;
  const maxIndex = Math.max(0, items.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const handleLike = (id: string) => {
    const newLiked = new Set(isLiked);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setIsLiked(newLiked);
    onLike(id);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, maxIndex]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const getTypeColor = (type: string) => {
    const colors = {
      sale: 'from-blue-500 to-cyan-500',
      rent: 'from-green-500 to-emerald-500',
      land: 'from-orange-500 to-amber-500',
      commercial: 'from-purple-500 to-pink-500',
      office: 'from-indigo-500 to-blue-500',
      villa: 'from-red-500 to-rose-500'
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      sale: 'شقق للبيع',
      rent: 'شقق للإيجار',
      land: 'أراضي',
      commercial: 'محلات تجارية',
      office: 'مكاتب إدارية',
      villa: 'فيلات وقصور'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (items.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="rounded-full w-10 h-10 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="rounded-full w-10 h-10 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm group cursor-pointer"
                    onClick={() => onItemClick(item.id)}>
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

                {/* Type Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className={`bg-gradient-to-r ${getTypeColor(item.type)} text-white shadow-lg`}>
                    {getTypeLabel(item.type)}
                  </Badge>
                </div>

                {/* Image */}
                <div className="relative overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {item.title.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4"
                  >
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${isLiked.has(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
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

                {/* Content */}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 ml-1" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {item.price}
                        <span className="text-sm text-gray-500">
                          {item.type === 'rent' ? ' ريال/شهر' : ' ريال'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <span className="flex items-center">
                        <Square className="w-4 h-4 ml-1" />
                        {item.area}
                      </span>
                      {item.bedrooms && (
                        <span className="flex items-center">
                          <Bed className="w-4 h-4 ml-1" />
                          {item.bedrooms}
                        </span>
                      )}
                      {item.bathrooms && (
                        <span className="flex items-center">
                          <Bath className="w-4 h-4 ml-1" />
                          {item.bathrooms}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 ml-1" />
                      <span className="font-medium">{item.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 ml-1" />
                        {item.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 ml-1" />
                        {item.likes}
                      </span>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemClick(item.id);
                        }}
                      >
                        عرض المزيد
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      {items.length > itemsPerView && (
        <div className="flex justify-center mt-6 space-x-2 rtl:space-x-reverse">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-emerald-500 w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RealEstateCarousel;
