import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hospital, MapPin, Phone, Mail, Globe, Star, Users, DollarSign, Ambulance, Car, Pill, Microscope, X, Clock, Shield, Heart, Brain, Baby, Stethoscope, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import HospitalRating from '@/components/HospitalRating';

interface Hospital {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  google_maps_url?: string;
  established_year?: number;
  bed_capacity?: number;
  emergency_services: boolean;
  icu_available: boolean;
  surgery_available: boolean;
  pediatrics_available: boolean;
  maternity_available: boolean;
  cardiology_available: boolean;
  neurology_available: boolean;
  oncology_available: boolean;
  specialties?: string[];
  insurance_accepted?: string[];
  operating_hours?: string;
  emergency_phone?: string;
  ambulance_available: boolean;
  parking_available: boolean;
  pharmacy_available: boolean;
  lab_services: boolean;
  radiology_services: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MedicalServicesHospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('hospitals')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        // استخدام بيانات وهمية في حالة فشل قاعدة البيانات
        setHospitals([]);
        return;
      }
      setHospitals((data as Hospital[]) || []);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      // استخدام بيانات وهمية في حالة الخطأ
      setHospitals([]);
      toast({
        title: 'تحذير',
        description: 'لا يمكن تحميل المستشفيات حالياً',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      public: 'حكومي',
      private: 'خاص',
      specialized: 'متخصص',
      university: 'جامعي'
    };
    return types[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      public: Building2,
      private: Heart,
      specialized: Stethoscope,
      university: Users
    };
    return icons[type] || Building2;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      public: 'bg-blue-100 text-blue-800 border-blue-200',
      private: 'bg-green-100 text-green-800 border-green-200',
      specialized: 'bg-purple-100 text-purple-800 border-purple-200',
      university: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredHospitals = selectedType === 'all' 
    ? hospitals 
    : hospitals.filter(hospital => hospital.type === selectedType);


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleCall = (phoneNumber: string) => {
    // فتح تطبيق الهاتف للاتصال
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleEmergency = (phoneNumber: string) => {
    // فتح تطبيق الهاتف للطوارئ
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleVisitWebsite = (website: string) => {
    // فتح الموقع في تبويب جديد
    window.open(website, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل المستشفيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <Hospital className="h-10 w-10 text-red-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-900">المستشفيات</h1>
          </div>
          <p className="text-sm text-gray-600 mb-4">اكتشف أفضل المستشفيات والمراكز الطبية</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {['public', 'private', 'specialized', 'university'].map((type) => {
              const Icon = getTypeIcon(type);
              const label = getTypeLabel(type);
              const color = getTypeColor(type);
              const count = hospitals.filter(h => h.type === type).length;
              
              return (
                <div key={type} className={`${color} rounded-lg p-3 text-center`}>
                  <Icon className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs">{label}</div>
                </div>
              );
            })}
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedType === 'all'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Hospital className="h-4 w-4 inline ml-1" />
              جميع المستشفيات
              <span className="mr-1 text-xs opacity-75">({hospitals.length})</span>
            </button>
            
            {['public', 'private', 'specialized', 'university'].map((type) => {
              const Icon = getTypeIcon(type);
              const label = getTypeLabel(type);
              const color = getTypeColor(type);
              const count = hospitals.filter(h => h.type === type).length;
              
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? `${color} shadow-md border-2`
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 inline ml-1" />
                  {label}
                  <span className="mr-1 text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hospitals Grid */}
        {filteredHospitals.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <Hospital className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedType === 'all' ? 'لا توجد مستشفيات' : `لا توجد مستشفيات ${getTypeLabel(selectedType)}`}
              </h3>
              <p className="text-gray-600 text-sm">
                {selectedType === 'all' 
                  ? 'لا توجد مستشفيات متاحة حالياً' 
                  : `لا توجد مستشفيات ${getTypeLabel(selectedType)} متاحة حالياً`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results Count */}
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                عرض {filteredHospitals.length} من {hospitals.length} مستشفى
                {selectedType !== 'all' && ` - ${getTypeLabel(selectedType)}`}
              </p>
            </div>
            
            {filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="bg-white hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-sm">
                {/* Hospital Image */}
                {hospital.image_url && (
                  <div className="aspect-[16/9] relative">
                    <img
                      src={hospital.image_url}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-3">
                    {hospital.logo_url ? (
                      <img
                        src={hospital.logo_url}
                        alt={hospital.name}
                        className="h-16 w-16 rounded-xl object-cover flex-shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Hospital className="h-8 w-8 text-red-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-gray-900 leading-tight mb-2">
                        {hospital.name}
                      </CardTitle>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(hospital.type)}`}>
                        {React.createElement(getTypeIcon(hospital.type), { className: "h-3 w-3 ml-1" })}
                        {getTypeLabel(hospital.type)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hospital.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{hospital.description}</p>
                    )}
                    
                    {/* المعلومات الأساسية */}
                    <div className="grid grid-cols-1 gap-3">
                      {hospital.address && (
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 leading-relaxed">{hospital.address}</span>
                        </div>
                      )}
                      {hospital.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{hospital.phone}</span>
                        </div>
                      )}
                      {hospital.bed_capacity && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700">السعة: <span className="font-medium">{hospital.bed_capacity} سرير</span></span>
                        </div>
                      )}
                      {hospital.operating_hours && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <span className="text-gray-700">{hospital.operating_hours}</span>
                        </div>
                      )}
                      {hospital.address && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700">{hospital.address}</span>
                        </div>
                      )}
                    </div>

                    {/* التخصصات والخدمات */}
                    <div className="space-y-3">
                      {/* التخصصات */}
                      {hospital.specialties && hospital.specialties.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-2">التخصصات</p>
                          <div className="flex flex-wrap gap-1">
                            {hospital.specialties.slice(0, 4).map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                                {specialty}
                              </Badge>
                            ))}
                            {hospital.specialties.length > 4 && (
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                +{hospital.specialties.length - 4} أخرى
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* الخدمات الأساسية */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">الخدمات الأساسية</p>
                        <div className="grid grid-cols-2 gap-2">
                          {hospital.emergency_services && (
                            <div className="flex items-center space-x-1 text-xs text-red-600">
                              <Shield className="h-3 w-3" />
                              <span>طوارئ</span>
                            </div>
                          )}
                          {hospital.icu_available && (
                            <div className="flex items-center space-x-1 text-xs text-blue-600">
                              <Heart className="h-3 w-3" />
                              <span>عناية مركزة</span>
                            </div>
                          )}
                          {hospital.surgery_available && (
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <Stethoscope className="h-3 w-3" />
                              <span>جراحة</span>
                            </div>
                          )}
                          {hospital.pediatrics_available && (
                            <div className="flex items-center space-x-1 text-xs text-purple-600">
                              <Baby className="h-3 w-3" />
                              <span>أطفال</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* خدمات إضافية */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">خدمات إضافية</p>
                        <div className="flex flex-wrap gap-2">
                          {hospital.ambulance_available && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              <Ambulance className="h-3 w-3 ml-1" />
                              إسعاف
                            </Badge>
                          )}
                          {hospital.parking_available && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              <Car className="h-3 w-3 ml-1" />
                              موقف
                            </Badge>
                          )}
                          {hospital.pharmacy_available && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              <Pill className="h-3 w-3 ml-1" />
                              صيدلية
                            </Badge>
                          )}
                          {hospital.lab_services && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              <Microscope className="h-3 w-3 ml-1" />
                              مختبر
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Insurance */}
                    {hospital.insurance_accepted && hospital.insurance_accepted.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">التأمين المقبول:</p>
                        <div className="flex flex-wrap gap-1">
                          {hospital.insurance_accepted.map((insurance, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {insurance}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                      {/* Hospital Rating */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <HospitalRating
                          hospitalId={hospital.id}
                          hospitalName={hospital.name}
                          currentRating={hospital.rating}
                          totalRatings={0}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {hospital.phone && (
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleCall(hospital.phone!)}
                          >
                            <Phone className="h-4 w-4 ml-1" />
                            اتصل
                          </Button>
                        )}
                        {hospital.emergency_phone && (
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => handleEmergency(hospital.emergency_phone!)}
                          >
                            <Shield className="h-4 w-4 ml-1" />
                            طوارئ
                          </Button>
                        )}
                        {hospital.website && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full col-span-2"
                            onClick={() => handleVisitWebsite(hospital.website!)}
                          >
                            <Globe className="h-4 w-4 ml-1" />
                            الموقع الإلكتروني
                          </Button>
                        )}
                        {hospital.address && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full col-span-2"
                            onClick={() => {
                              const mapsUrl = hospital.google_maps_url || 
                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`;
                              window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <MapPin className="h-4 w-4 ml-1" />
                            خرائط جوجل
                          </Button>
                        )}
                      </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalServicesHospitals;
