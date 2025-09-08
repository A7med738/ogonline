import { useState } from "react";
import { Briefcase, Search, ArrowLeft, Clock, Calendar, MapPin, Phone, MessageCircle, DollarSign, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Jobs = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'employer' | 'jobseeker' | null>(null);
  const [jobType, setJobType] = useState<'permanent' | 'temporary' | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);

  // Employer Journey Component
  const EmployerJourney = () => {
    if (!jobType) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              اختر نوع الفرصة
            </h2>
            <p className="text-muted-foreground">
              حدد نوع الوظيفة التي تريد الإعلان عنها
            </p>
          </div>

          <div className="space-y-4">
            {/* Permanent Job */}
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
              onClick={() => setJobType('permanent')}
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    وظيفة دائمة
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    راتب شهري، عقد، استقرار وظيفي
                  </p>
                </div>
              </div>
            </Card>

            {/* Temporary Job */}
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-secondary/50"
              onClick={() => setJobType('temporary')}
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    فرصة مؤقتة (شُغلانة يوم)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    مهام يومية، عمالة حرفية، مشاريع قصيرة
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    if (!showJobForm) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setJobType(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة لاختيار نوع الفرصة
            </Button>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {jobType === 'permanent' ? 'إدارة الوظائف الدائمة' : 'إدارة الفرص المؤقتة'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Add New Job */}
            <Card className="p-6">
              <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-primary mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  إضافة {jobType === 'permanent' ? 'وظيفة جديدة' : 'فرصة جديدة'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  انشر إعلان جديد للعثور على المرشح المناسب
                </p>
                <Button 
                  onClick={() => setShowJobForm(true)}
                  className="w-full"
                >
                  إضافة إعلان
                </Button>
              </div>
            </Card>

            {/* Browse Candidates */}
            <Card className="p-6">
              <div className="text-center">
                <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Users className="h-8 w-8 text-secondary mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  استعراض المرشحين
                </h3>
                <p className="text-muted-foreground mb-4">
                  تصفح ملفات الباحثين عن عمل في منطقتك
                </p>
                <Button variant="secondary" className="w-full">
                  استعراض الملفات
                </Button>
              </div>
            </Card>

            {/* Digital Reputation */}
            <Card className="p-6 md:col-span-2">
              <div className="text-center">
                <div className="bg-accent/10 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Star className="h-8 w-8 text-accent mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  ملف السمعة الرقمية
                </h3>
                <p className="text-muted-foreground mb-4">
                  اطلع على تقييمات العمال والمهنيين السابقين
                </p>
                <Button variant="outline" className="w-full max-w-xs">
                  عرض التقييمات
                </Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    // Job Form
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => setShowJobForm(false)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للقائمة الرئيسية
          </Button>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            إضافة {jobType === 'permanent' ? 'وظيفة دائمة' : 'فرصة مؤقتة'}
          </h2>
        </div>

        <Card className="p-6">
          <form className="space-y-6">
            {/* Job Title */}
            <div>
              <Label htmlFor="title" className="text-right block mb-2">
                العنوان *
              </Label>
              <Input
                id="title"
                placeholder='مثال: "مطلوب كهربائي" أو "محاسب لمحل تجاري"'
                className="text-right"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-right block mb-2">
                الوصف *
              </Label>
              <Textarea
                id="description"
                placeholder="اكتب تفاصيل الوظيفة والمتطلبات..."
                className="text-right min-h-[100px]"
              />
            </div>

            {/* Location */}
            <div>
              <Label className="text-right block mb-2">
                الموقع *
              </Label>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 ml-2" />
                تحديد الموقع على الخريطة
              </Button>
            </div>

            {/* Payment */}
            <div>
              <Label htmlFor="payment" className="text-right block mb-2">
                المقابل المادي (اختياري)
              </Label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payment"
                  placeholder={jobType === 'permanent' ? "الراتب الشهري بالجنيه" : "الأجر اليومي بالجنيه"}
                  className="text-right pr-10"
                />
              </div>
            </div>

            {/* Contact Method */}
            <div>
              <Label className="text-right block mb-2">
                طريقة التواصل *
              </Label>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 ml-2" />
                  رقم الهاتف المباشر
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 ml-2" />
                  رسائل المنصة
                </Button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                نشر الإعلان
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowJobForm(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/business")}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">وظائف وفرص</h1>
          </div>

          {/* User Type Selection */}
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                اختر نوع حسابك
              </h2>
              <p className="text-muted-foreground">
                لنقدم لك التجربة الأنسب حسب احتياجك
              </p>
            </div>

            <div className="space-y-6">
              {/* Employer Button */}
              <Card 
                className="p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
                onClick={() => setUserType('employer')}
              >
                <div className="flex items-center justify-center space-x-6 space-x-reverse">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      أنا صاحب عمل
                    </h3>
                    <p className="text-muted-foreground">
                      أبحث عن موظف أو عامل
                    </p>
                  </div>
                </div>
              </Card>

              {/* Job Seeker Button */}
              <Card 
                className="p-8 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
                onClick={() => setUserType('jobseeker')}
              >
                <div className="flex items-center justify-center space-x-6 space-x-reverse">
                  <div className="bg-secondary/10 p-4 rounded-full">
                    <Search className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      أنا باحث عن عمل
                    </h3>
                    <p className="text-muted-foreground">
                      أبحث عن فرصة عمل
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder for employer/jobseeker views
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setUserType(null)}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {userType === 'employer' ? 'رحلة صاحب العمل' : 'رحلة الباحث عن عمل'}
          </h1>
        </div>

        {userType === 'employer' ? (
          <EmployerJourney />
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              سيتم تطوير واجهة الباحث عن عمل قريباً
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;