import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Upload, 
  MapPin, 
  Home, 
  Building, 
  Store, 
  Briefcase, 
  Crown,
  Landmark,
  Plus,
  Minus,
  Save,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPropertyModal = ({ isOpen, onClose, onSuccess }: AddPropertyModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: '',
    transaction_type: '',
    price: '',
    area: '',
    bedrooms: 0,
    bathrooms: 0,
    floors: 1,
    year_built: '',
    location: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    features: [] as string[],
    images: [] as string[]
  });

  const propertyTypes = [
    { id: 'apartment', label: 'شقة', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { id: 'villa', label: 'فيلا', icon: Crown, color: 'from-purple-500 to-pink-500' },
    { id: 'land', label: 'أرض', icon: Landmark, color: 'from-green-500 to-emerald-500' },
    { id: 'commercial', label: 'محل تجاري', icon: Store, color: 'from-orange-500 to-red-500' },
    { id: 'office', label: 'مكتب', icon: Briefcase, color: 'from-indigo-500 to-blue-500' },
    { id: 'warehouse', label: 'مستودع', icon: Building, color: 'from-gray-500 to-slate-500' }
  ];

  const transactionTypes = [
    { id: 'sale', label: 'للبيع' },
    { id: 'rent', label: 'للإيجار' }
  ];

  const availableFeatures = [
    'موقف سيارات', 'حديقة', 'مسبح', 'مصعد', 'أمن 24/7', 'نادي رياضي',
    'مسجد', 'مدرسة', 'مستشفى', 'مركز تجاري', 'مواصلات عامة', 'شاطئ قريب'
  ];

  const steps = [
    { id: 'basic', title: 'المعلومات الأساسية' },
    { id: 'details', title: 'التفاصيل' },
    { id: 'location', title: 'الموقع' },
    { id: 'contact', title: 'معلومات التواصل' },
    { id: 'features', title: 'المميزات' },
    { id: 'images', title: 'الصور' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = async (files: FileList) => {
    // In a real app, you would upload to Supabase Storage
    // For now, we'll just simulate the upload
    const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        owner_id: user.id,
        status: 'pending'
      };

      const { error } = await supabase
        .from('properties')
        .insert([propertyData]);

      if (error) throw error;

      toast({
        title: "تم إرسال العقار بنجاح!",
        description: "سيتم مراجعة العقار من قبل الإدارة قبل النشر"
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "خطأ في إرسال العقار",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان العقار *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="مثال: شقة فاخرة في الحي الراقي"
          className="text-right"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف العقار</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="وصف مفصل للعقار..."
          className="text-right min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>نوع العقار *</Label>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant={formData.property_type === type.id ? "default" : "outline"}
                  className={cn(
                    "w-full justify-start h-auto p-4",
                    formData.property_type === type.id 
                      ? `bg-gradient-to-r ${type.color} text-white` 
                      : "bg-white/70 backdrop-blur-sm border-white/30"
                  )}
                  onClick={() => handleInputChange('property_type', type.id)}
                >
                  <type.icon className="w-4 h-4 ml-2" />
                  {type.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>نوع المعاملة *</Label>
          <div className="space-y-2">
            {transactionTypes.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant={formData.transaction_type === type.id ? "default" : "outline"}
                  className={cn(
                    "w-full justify-start",
                    formData.transaction_type === type.id 
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white" 
                      : "bg-white/70 backdrop-blur-sm border-white/30"
                  )}
                  onClick={() => handleInputChange('transaction_type', type.id)}
                >
                  {type.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">السعر (جنيه مصري) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="مثال: 500000"
            className="text-right"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">المساحة (متر مربع)</Label>
          <Input
            id="area"
            type="number"
            value={formData.area}
            onChange={(e) => handleInputChange('area', e.target.value)}
            placeholder="مثال: 120"
            className="text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>عدد الغرف</Label>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('bedrooms', Math.max(0, formData.bedrooms - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center">{formData.bedrooms}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('bedrooms', formData.bedrooms + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>عدد الحمامات</Label>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('bathrooms', Math.max(0, formData.bathrooms - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center">{formData.bathrooms}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('bathrooms', formData.bathrooms + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>عدد الطوابق</Label>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('floors', Math.max(1, formData.floors - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center">{formData.floors}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('floors', formData.floors + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year_built">سنة البناء</Label>
          <Input
            id="year_built"
            type="number"
            value={formData.year_built}
            onChange={(e) => handleInputChange('year_built', e.target.value)}
            placeholder="مثال: 2020"
            className="text-right"
          />
        </div>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="location">المنطقة *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="مثال: الرياض - حي النخيل"
          className="text-right"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">العنوان التفصيلي</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="العنوان الكامل للعقار..."
          className="text-right min-h-[80px]"
        />
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contact_phone">رقم الهاتف *</Label>
        <Input
          id="contact_phone"
          value={formData.contact_phone}
          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
          placeholder="مثال: 0501234567"
          className="text-right"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_email">البريد الإلكتروني</Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => handleInputChange('contact_email', e.target.value)}
          placeholder="مثال: example@email.com"
          className="text-right"
        />
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>المميزات المتاحة</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableFeatures.map((feature) => (
            <motion.div
              key={feature}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant={formData.features.includes(feature) ? "default" : "outline"}
                className={cn(
                  "w-full justify-start",
                  formData.features.includes(feature) 
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white" 
                    : "bg-white/70 backdrop-blur-sm border-white/30"
                )}
                onClick={() => handleFeatureToggle(feature)}
              >
                {feature}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {formData.features.length > 0 && (
        <div className="space-y-2">
          <Label>المميزات المختارة</Label>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature) => (
              <Badge
                key={feature}
                variant="secondary"
                className="bg-emerald-100 text-emerald-700"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderImages = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>صور العقار</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">اسحب وأفلت الصور هنا أو اضغط للاختيار</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <Upload className="w-4 h-4 ml-2" />
            اختيار الصور
          </Button>
        </div>
      </div>

      {formData.images.length > 0 && (
        <div className="space-y-2">
          <Label>الصور المختارة</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                  onClick={() => handleInputChange('images', formData.images.filter((_, i) => i !== index))}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return renderBasicInfo();
      case 'details':
        return renderDetails();
      case 'location':
        return renderLocation();
      case 'contact':
        return renderContact();
      case 'features':
        return renderFeatures();
      case 'images':
        return renderImages();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">إضافة عقار جديد</h1>
              <p className="text-emerald-100">{steps[currentStep].title}</p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex space-x-2 rtl:space-x-reverse">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 rounded-full flex-1 transition-all duration-300",
                    index <= currentStep 
                      ? "bg-white" 
                      : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            السابق
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8"
            >
              <Save className="w-4 h-4 ml-2" />
              {loading ? 'جاري الإرسال...' : 'إرسال العقار'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8"
            >
              التالي
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AddPropertyModal;
