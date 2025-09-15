import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  Square, 
  Bed, 
  Bath,
  Car,
  Calendar,
  Star,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FilterOptions {
  priceRange: [number, number];
  areaRange: [number, number];
  bedrooms: number[];
  bathrooms: number[];
  propertyType: string[];
  furnished: boolean | null;
  yearBuilt: [number, number];
  rating: number;
  features: string[];
}

interface RealEstateFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
}

export const RealEstateFilters: React.FC<RealEstateFiltersProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 10000000],
    areaRange: [0, 1000],
    bedrooms: [],
    bathrooms: [],
    propertyType: [],
    furnished: null,
    yearBuilt: [1990, 2024],
    rating: 0,
    features: []
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['price', 'area']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: [0, 10000000],
      areaRange: [0, 1000],
      bedrooms: [],
      bathrooms: [],
      propertyType: [],
      furnished: null,
      yearBuilt: [1990, 2024],
      rating: 0,
      features: []
    });
    onResetFilters();
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('ar-SA').format(value);
  };

  const formatArea = (value: number) => {
    return `${value} م²`;
  };

  const filterSections = [
    {
      id: 'price',
      title: 'نطاق السعر',
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>السعر (جنيه)</Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
              min={0}
              max={10000000}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'area',
      title: 'المساحة',
      icon: Square,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>المساحة (متر مربع)</Label>
            <Slider
              value={filters.areaRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, areaRange: value as [number, number] }))}
              min={0}
              max={1000}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatArea(filters.areaRange[0])}</span>
              <span>{formatArea(filters.areaRange[1])}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rooms',
      title: 'الغرف والحمامات',
      icon: Bed,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm sm:text-base">عدد الغرف</Label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <Button
                  key={num}
                  variant={filters.bedrooms.includes(num) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newBedrooms = filters.bedrooms.includes(num)
                      ? filters.bedrooms.filter(n => n !== num)
                      : [...filters.bedrooms, num];
                    setFilters(prev => ({ ...prev, bedrooms: newBedrooms }));
                  }}
                  className="text-xs px-2 py-1 sm:px-3 sm:py-2"
                >
                  {num}+
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm sm:text-base">عدد الحمامات</Label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <Button
                  key={num}
                  variant={filters.bathrooms.includes(num) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newBathrooms = filters.bathrooms.includes(num)
                      ? filters.bathrooms.filter(n => n !== num)
                      : [...filters.bathrooms, num];
                    setFilters(prev => ({ ...prev, bathrooms: newBathrooms }));
                  }}
                  className="text-xs px-2 py-1 sm:px-3 sm:py-2"
                >
                  {num}+
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'type',
      title: 'نوع العقار',
      icon: MapPin,
      content: (
        <div className="space-y-3">
          {[
            { id: 'sale', label: 'شقق للبيع' },
            { id: 'rent', label: 'شقق للإيجار' },
            { id: 'land', label: 'أراضي' },
            { id: 'commercial', label: 'محلات تجارية' },
            { id: 'office', label: 'مكاتب إدارية' },
            { id: 'villa', label: 'فيلات وقصور' }
          ].map(type => (
            <div key={type.id} className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id={type.id}
                checked={filters.propertyType.includes(type.id)}
                onCheckedChange={(checked) => {
                  const newTypes = checked
                    ? [...filters.propertyType, type.id]
                    : filters.propertyType.filter(t => t !== type.id);
                  setFilters(prev => ({ ...prev, propertyType: newTypes }));
                }}
              />
              <Label htmlFor={type.id} className="text-sm">{type.label}</Label>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'features',
      title: 'المميزات',
      icon: Star,
      content: (
        <div className="space-y-3">
          {[
            { id: 'furnished', label: 'مفروش' },
            { id: 'parking', label: 'موقف سيارات' },
            { id: 'balcony', label: 'شرفة' },
            { id: 'garden', label: 'حديقة' },
            { id: 'pool', label: 'مسبح' },
            { id: 'elevator', label: 'مصعد' },
            { id: 'security', label: 'أمن' },
            { id: 'gym', label: 'صالة رياضية' }
          ].map(feature => (
            <div key={feature.id} className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id={feature.id}
                checked={filters.features.includes(feature.id)}
                onCheckedChange={(checked) => {
                  const newFeatures = checked
                    ? [...filters.features, feature.id]
                    : filters.features.filter(f => f !== feature.id);
                  setFilters(prev => ({ ...prev, features: newFeatures }));
                }}
              />
              <Label htmlFor={feature.id} className="text-sm">{feature.label}</Label>
            </div>
          ))}
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold">فلترة العقارات</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {filterSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <Card key={section.id} className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Icon className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </Button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          {section.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="p-4 sm:p-6 border-t bg-gray-50">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 rtl:sm:space-x-reverse">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex-1 text-sm sm:text-base"
            >
              إعادة تعيين
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm sm:text-base"
            >
              تطبيق الفلاتر
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RealEstateFilters;
