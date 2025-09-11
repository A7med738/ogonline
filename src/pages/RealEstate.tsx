import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Home, 
  Building2, 
  Store, 
  Briefcase, 
  Crown,
  MapPin,
  ArrowRight,
  Star,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  Filter,
  Grid3X3,
  List,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AnimatedIcon from '@/components/AnimatedIcon';
import RealEstateCard from '@/components/RealEstateCard';
import RealEstateFilters from '@/components/RealEstateFilters';

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

const RealEstate = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleViewDetails = (id: string) => {
    navigate(`/real-estate/${id}`);
  };

  const handleLike = (id: string) => {
    console.log('Like property:', id);
    // Handle like functionality
  };

  const handleShare = (id: string) => {
    console.log('Share property:', id);
    // Handle share functionality
  };

  const handleContact = (id: string) => {
    console.log('Contact for property:', id);
    // Handle contact functionality
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // Apply filters to data
  };

  const handleResetFilters = () => {
    console.log('Reset filters');
    // Reset filters
  };

  const realEstateTypes = [
    { id: 'sale', label: 'شقق للبيع', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { id: 'rent', label: 'شقق للإيجار', icon: Building2, color: 'from-green-500 to-emerald-500' },
    { id: 'land', label: 'أراضي', icon: MapPin, color: 'from-orange-500 to-amber-500' },
    { id: 'commercial', label: 'محلات تجارية', icon: Store, color: 'from-purple-500 to-pink-500' },
    { id: 'office', label: 'مكاتب إدارية', icon: Briefcase, color: 'from-indigo-500 to-blue-500' },
    { id: 'villa', label: 'فيلات وقصور', icon: Crown, color: 'from-red-500 to-rose-500' }
  ];

  const sampleData: RealEstateItem[] = [
    {
      id: '1',
      title: 'شقة فاخرة في قلب المدينة',
      type: 'sale',
      price: '2,500,000',
      location: 'الرياض، حي النخيل',
      area: '150 متر مربع',
      bedrooms: 3,
      bathrooms: 2,
      image: '/placeholder.svg',
      featured: true,
      rating: 4.8,
      views: 1250,
      likes: 89
    },
    {
      id: '2',
      title: 'شقة للإيجار - إطلالة بحرية',
      type: 'rent',
      price: '8,000',
      location: 'جدة، الكورنيش',
      area: '120 متر مربع',
      bedrooms: 2,
      bathrooms: 2,
      image: '/placeholder.svg',
      featured: false,
      rating: 4.6,
      views: 890,
      likes: 67
    },
    {
      id: '3',
      title: 'أرض سكنية - موقع مميز',
      type: 'land',
      price: '1,200,000',
      location: 'الدمام، حي الفيصلية',
      area: '500 متر مربع',
      image: '/placeholder.svg',
      featured: true,
      rating: 4.9,
      views: 2100,
      likes: 156
    },
    {
      id: '4',
      title: 'محل تجاري - شارع رئيسي',
      type: 'commercial',
      price: '15,000',
      location: 'الرياض، شارع التحلية',
      area: '80 متر مربع',
      image: '/placeholder.svg',
      featured: false,
      rating: 4.4,
      views: 650,
      likes: 43
    },
    {
      id: '5',
      title: 'مكتب إداري - طابق كامل',
      type: 'office',
      price: '25,000',
      location: 'الرياض، حي العليا',
      area: '200 متر مربع',
      image: '/placeholder.svg',
      featured: true,
      rating: 4.7,
      views: 980,
      likes: 72
    },
    {
      id: '6',
      title: 'فيلا فاخرة - حديقة واسعة',
      type: 'villa',
      price: '4,500,000',
      location: 'جدة، حي الروضة',
      area: '400 متر مربع',
      bedrooms: 5,
      bathrooms: 4,
      image: '/placeholder.svg',
      featured: true,
      rating: 4.9,
      views: 3200,
      likes: 234
    }
  ];

  const filteredData = sampleData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

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

  const typeCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Header - Mobile Optimized */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg"
      >
        <div className="px-4 py-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <AnimatedIcon size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  العقارات
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">اكتشف أفضل العقارات</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70 px-3"
              >
                <Filter className="w-4 h-4 ml-1" />
                <span className="hidden sm:inline">فلترة</span>
              </Button>
              <div className="flex bg-white/50 backdrop-blur-sm rounded-lg p-1 border border-white/30">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-md p-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-md p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Search Bar - Mobile Optimized */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ابحث عن عقار..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-3 py-3 text-base bg-white/70 backdrop-blur-sm border-white/30 rounded-xl shadow-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="px-4 py-6">
        {/* Property Types - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center sm:text-2xl">
            أنواع العقارات
          </h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4"
          >
            {realEstateTypes.map((type, index) => {
              const IconComponent = type.icon;
              return (
                <motion.div
                  key={type.id}
                  variants={typeCardVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedType(type.id)}
                >
                  <Card className={cn(
                    "relative overflow-hidden border-0 shadow-lg transition-all duration-300",
                    selectedType === type.id 
                      ? "ring-2 ring-emerald-500 shadow-2xl" 
                      : "hover:shadow-xl",
                    `bg-gradient-to-br ${type.color}`
                  )}>
                    <CardContent className="p-3 sm:p-4 text-center">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                      >
                        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </motion.div>
                      <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight">
                        {type.label}
                      </h3>
                      {selectedType === type.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center"
                        >
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full" />
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Properties Grid - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                العقارات المتاحة
              </h2>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs sm:text-sm">
                {filteredData.length}
              </Badge>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "grid gap-4 sm:gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}
          >
            <AnimatePresence>
              {filteredData.map((item, index) => (
                <RealEstateCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onViewDetails={handleViewDetails}
                  onLike={handleLike}
                  onShare={handleShare}
                  onContact={handleContact}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              لم نجد عقارات تطابق بحثك
            </h3>
            <p className="text-gray-500 mb-6">
              جرب تغيير معايير البحث أو استخدم فلاتر مختلفة
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
            >
              إعادة تعيين البحث
            </Button>
          </motion.div>
        )}
      </div>

      {/* Filters Modal */}
      <RealEstateFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default RealEstate;
