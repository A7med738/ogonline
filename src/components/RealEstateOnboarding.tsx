import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Home, 
  User, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProps {
  onComplete: (userType: 'buyer' | 'seller' | 'broker', preferences: any) => void;
  onSkip: () => void;
}

const RealEstateOnboarding = ({ onComplete, onSkip }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState<'buyer' | 'seller' | 'broker' | null>(null);
  const [preferences, setPreferences] = useState<any>({});

  const steps = [
    {
      id: 'welcome',
      title: 'مرحباً بك في عالم العقارات',
      subtitle: 'سنساعدك في العثور على العقار المثالي أو بيع عقارك',
      content: 'welcome'
    },
    {
      id: 'userType',
      title: 'ما هو دورك في عالم العقارات؟',
      subtitle: 'اختر الدور الذي يناسبك',
      content: 'userType'
    },
    {
      id: 'preferences',
      title: 'أخبرنا عن تفضيلاتك',
      subtitle: 'سنساعدك في العثور على ما تبحث عنه',
      content: 'preferences'
    },
    {
      id: 'complete',
      title: 'تم إعداد حسابك بنجاح!',
      subtitle: 'أنت الآن جاهز لاستكشاف عالم العقارات',
      content: 'complete'
    }
  ];

  const userTypes = [
    {
      id: 'buyer',
      title: 'مشتري',
      description: 'أبحث عن عقار للشراء أو الإيجار',
      icon: Home,
      color: 'from-blue-500 to-cyan-500',
      features: ['عقارات للبيع', 'عقارات للإيجار', 'فلترة متقدمة', 'إشعارات فورية']
    },
    {
      id: 'seller',
      title: 'تاجر',
      description: 'لدي عقارات للبيع أو الإيجار',
      icon: Building,
      color: 'from-emerald-500 to-green-500',
      features: ['إضافة عقارات', 'إدارة المبيعات', 'إحصائيات مفصلة', 'دعم العملاء']
    },
    {
      id: 'broker',
      title: 'سمسار',
      description: 'أعمل كوسيط في العقارات',
      icon: User,
      color: 'from-purple-500 to-pink-500',
      features: ['إدارة العملاء', 'عقارات متعددة', 'عمولات', 'شبكة واسعة']
    }
  ];

  const preferenceQuestions = {
    buyer: [
      {
        id: 'propertyType',
        question: 'ما نوع العقار الذي تبحث عنه؟',
        type: 'multiple',
        options: ['شقة', 'فيلا', 'أرض', 'محل تجاري', 'مكتب', 'مستودع']
      },
      {
        id: 'budget',
        question: 'ما هو ميزانيتك التقريبية؟',
        type: 'range',
        options: ['أقل من 500,000', '500,000 - 1,000,000', '1,000,000 - 2,000,000', 'أكثر من 2,000,000']
      },
      {
        id: 'location',
        question: 'في أي منطقة تفضل؟',
        type: 'multiple',
        options: ['الحي الأول', 'الحي الثاني', 'الحي الثالث', 'المنطقة التجارية', 'المنطقة السكنية']
      }
    ],
    seller: [
      {
        id: 'propertyCount',
        question: 'كم عدد العقارات التي تريد إدراجها؟',
        type: 'single',
        options: ['1-3 عقارات', '4-10 عقارات', 'أكثر من 10 عقارات']
      },
      {
        id: 'experience',
        question: 'ما هي خبرتك في العقارات؟',
        type: 'single',
        options: ['مبتدئ', 'متوسط', 'خبير']
      }
    ],
    broker: [
      {
        id: 'license',
        question: 'هل لديك ترخيص سمسرة عقارية؟',
        type: 'single',
        options: ['نعم', 'لا', 'قيد الإجراء']
      },
      {
        id: 'experience',
        question: 'كم سنة من الخبرة لديك؟',
        type: 'single',
        options: ['أقل من سنة', '1-3 سنوات', '3-5 سنوات', 'أكثر من 5 سنوات']
      }
    ]
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

  const handleUserTypeSelect = (type: 'buyer' | 'seller' | 'broker') => {
    setSelectedUserType(type);
    setPreferences({});
  };

  const handlePreferenceChange = (questionId: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleComplete = () => {
    if (selectedUserType) {
      onComplete(selectedUserType, preferences);
    }
  };

  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto"
      >
        <Building className="w-12 h-12 text-white" />
      </motion.div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">مرحباً بك في عالم العقارات</h2>
        <p className="text-gray-600 text-lg">سنساعدك في العثور على العقار المثالي أو بيع عقارك بأفضل الطرق</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[
          { icon: Home, title: 'عقارات متنوعة', desc: 'شقق، فيلات، أراضي' },
          { icon: Star, title: 'جودة عالية', desc: 'عقارات مختارة بعناية' },
          { icon: Users, title: 'مجتمع آمن', desc: 'عملاء ووسطاء موثوقين' }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-white/50 rounded-lg"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderUserType = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {userTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-xl",
                selectedUserType === type.id 
                  ? "ring-2 ring-emerald-500 bg-emerald-50" 
                  : "hover:shadow-lg"
              )}
              onClick={() => handleUserTypeSelect(type.id as any)}
            >
              <CardContent className="p-6 text-center">
                <motion.div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                    `bg-gradient-to-r ${type.color}`
                  )}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <type.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{type.title}</h3>
                <p className="text-gray-600 mb-4">{type.description}</p>
                
                <div className="space-y-2">
                  {type.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderPreferences = () => {
    if (!selectedUserType) return null;
    
    const questions = preferenceQuestions[selectedUserType];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800">{question.question}</h3>
            
            {question.type === 'multiple' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {question.options.map((option) => (
                  <motion.div
                    key={option}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={preferences[question.id]?.includes(option) ? "default" : "outline"}
                      className={cn(
                        "w-full justify-start",
                        preferences[question.id]?.includes(option) 
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white" 
                          : "bg-white/70 backdrop-blur-sm border-white/30"
                      )}
                      onClick={() => {
                        const current = preferences[question.id] || [];
                        const updated = current.includes(option)
                          ? current.filter((item: string) => item !== option)
                          : [...current, option];
                        handlePreferenceChange(question.id, updated);
                      }}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <motion.div
                    key={option}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={preferences[question.id] === option ? "default" : "outline"}
                      className={cn(
                        "w-full justify-start",
                        preferences[question.id] === option 
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white" 
                          : "bg-white/70 backdrop-blur-sm border-white/30"
                      )}
                      onClick={() => handlePreferenceChange(question.id, option)}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto"
      >
        <CheckCircle className="w-12 h-12 text-white" />
      </motion.div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">تم إعداد حسابك بنجاح!</h2>
        <p className="text-gray-600 text-lg">
          أنت الآن جاهز لاستكشاف عالم العقارات كـ {userTypes.find(t => t.id === selectedUserType)?.title}
        </p>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3">ما يمكنك فعله الآن:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
          {selectedUserType === 'buyer' && (
            <>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Home className="w-5 h-5 text-emerald-500" />
                <span>تصفح العقارات المتاحة</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>احصل على إشعارات للعقارات الجديدة</span>
              </div>
            </>
          )}
          {(selectedUserType === 'seller' || selectedUserType === 'broker') && (
            <>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Building className="w-5 h-5 text-emerald-500" />
                <span>أضف عقاراتك للبيع</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Users className="w-5 h-5 text-emerald-500" />
                <span>ادار عملائك وعقاراتك</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (steps[currentStep].content) {
      case 'welcome':
        return renderWelcome();
      case 'userType':
        return renderUserType();
      case 'preferences':
        return renderPreferences();
      case 'complete':
        return renderComplete();
      default:
        return null;
    }
  };

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
              <h1 className="text-2xl font-bold">{steps[currentStep].title}</h1>
              <p className="text-emerald-100">{steps[currentStep].subtitle}</p>
            </div>
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-white hover:bg-white/20"
            >
              تخطي
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
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>السابق</span>
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8"
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              ابدأ الآن
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={currentStep === 1 && !selectedUserType}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8"
            >
              <span>التالي</span>
              <ChevronRight className="w-4 h-4 mr-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RealEstateOnboarding;
