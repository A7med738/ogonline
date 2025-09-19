import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModernServiceCard } from "@/components/ModernServiceCard";
import { Dumbbell, Trophy, GraduationCap, Zap, Baby, Gamepad2, Palette, Music } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

interface ChildrenService {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  phone2?: string;
  whatsapp?: string;
  facebook_url?: string;
  google_maps_url?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CityServicesChildren = () => {
  const [services, setServices] = useState<ChildrenService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any).from('children_services').select('*').eq('is_active', true);
      
      if (error) throw error;
      setServices(data as ChildrenService[] || []);
    } catch (error) {
      console.error('Error loading children services:', error);
      setError('حدث خطأ في تحميل خدمات الأطفال');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'playground': 'ملاهي',
      'kids_area': 'كيدز ايريا',
      'entertainment': 'أنشطة ترفيهية',
      'games': 'ألعاب',
      'art': 'فنون',
      'music': 'موسيقى'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'playground': Baby,
      'kids_area': Gamepad2,
      'entertainment': Zap,
      'games': Gamepad2,
      'art': Palette,
      'music': Music
    };
    return icons[type] || Baby;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'playground': 'from-pink-500 to-rose-500',
      'kids_area': 'from-blue-500 to-cyan-500',
      'entertainment': 'from-purple-500 to-violet-500',
      'games': 'from-green-500 to-emerald-500',
      'art': 'from-orange-500 to-amber-500',
      'music': 'from-indigo-500 to-purple-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  const filteredServices = services.filter(service => 
    selectedType === 'all' || service.type === selectedType
  );

  const serviceTypes = [
    { key: 'all', label: 'الكل', icon: Baby, color: 'from-gray-500 to-slate-500' },
    { key: 'playground', label: 'ملاهي', icon: Baby, color: 'from-pink-500 to-rose-500' },
    { key: 'kids_area', label: 'كيدز ايريا', icon: Gamepad2, color: 'from-blue-500 to-cyan-500' },
    { key: 'entertainment', label: 'أنشطة ترفيهية', icon: Zap, color: 'from-purple-500 to-violet-500' }
  ];

  const getTypeCount = (type: string) => {
    if (type === 'all') return services.length;
    return services.filter(service => service.type === type).length;
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل خدمات الأطفال...</p>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في التحميل</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadServices}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                <Baby className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">خدمات الأطفال</h1>
            <p className="text-gray-600 text-lg">اكتشف أفضل الأماكن الترفيهية والأنشطة للأطفال في المدينة</p>
          </div>

          {/* Service Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">فئات الخدمات</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {serviceTypes.map((type) => {
                const Icon = type.icon;
                const count = getTypeCount(type.key);
                const isSelected = selectedType === type.key;
                
                return (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className={`relative p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                      isSelected 
                        ? `bg-gradient-to-br ${type.color} text-white shadow-lg` 
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Services Grid */}
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredServices.map((service) => {
                const TypeIcon = getTypeIcon(service.type);
                const typeColor = getTypeColor(service.type);
                
                return (
                  <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      {service.image_url ? (
                        <img 
                          src={service.image_url} 
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Baby className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      
                      {/* Type Badge */}
                      <div className="absolute top-3 right-3">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg bg-gradient-to-r ${typeColor} text-white`}>
                          <TypeIcon className="w-3 h-3" />
                          <span className="text-xs font-medium">{getTypeLabel(service.type)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Logo and Name */}
                      <div className="flex items-start space-x-3 mb-3">
                        {service.logo_url ? (
                          <img 
                            src={service.logo_url} 
                            alt={`${service.name} logo`}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeColor} flex items-center justify-center flex-shrink-0`}>
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                            {service.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {getTypeLabel(service.type)}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {service.description && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                          {service.description}
                        </p>
                      )}

                      {/* Basic Info */}
                      <div className="space-y-2 mb-4">
                        {service.address && (
                          <div className="flex items-start space-x-2">
                            <div className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0">
                              📍
                            </div>
                            <p className="text-xs text-gray-600 flex-1">{service.address}</p>
                          </div>
                        )}
                        
                        {service.phone && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 text-gray-400 flex-shrink-0">📞</div>
                            <p className="text-xs text-gray-600">{service.phone}</p>
                          </div>
                        )}

                        {service.google_maps_url && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 text-gray-400 flex-shrink-0">🗺️</div>
                            <a 
                              href={service.google_maps_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              عرض على خرائط جوجل
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        {service.phone && (
                          <a
                            href={`tel:${service.phone}`}
                            className="flex items-center justify-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                          >
                            <span>📞</span>
                            <span>اتصل</span>
                          </a>
                        )}
                        
                        {service.whatsapp && (
                          <a
                            href={`https://wa.me/${service.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                          >
                            <span>💬</span>
                            <span>واتساب</span>
                          </a>
                        )}

                        {service.website && (
                          <a
                            href={service.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                          >
                            <span>🌐</span>
                            <span>الموقع</span>
                          </a>
                        )}

                        {service.google_maps_url && (
                          <a
                            href={service.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                          >
                            <span>🗺️</span>
                            <span>خرائط</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎠</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedType === 'all' ? 'لا توجد خدمات أطفال متاحة' : `لا توجد خدمات من نوع ${getTypeLabel(selectedType)}`}
              </h2>
              <p className="text-gray-600">
                {selectedType === 'all' 
                  ? 'لم يتم إضافة أي خدمات أطفال بعد' 
                  : `لم يتم إضافة أي خدمات من نوع ${getTypeLabel(selectedType)} بعد`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default CityServicesChildren;
