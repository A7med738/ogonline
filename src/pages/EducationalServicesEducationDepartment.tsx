import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Phone, MapPin, Clock, FileText, Users, AlertCircle, GraduationCap, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const EducationalServicesEducationDepartment = () => {
  const navigate = useNavigate();

  const educationDepartmentServices = [
    {
      title: "إدارة التعليم العام",
      description: "الإدارة المسؤولة عن التعليم العام في المدينة",
      phone: "01234567890",
      address: "شارع التعليم، حدائق أكتوبر",
      hours: "السبت - الخميس: 8:00 - 16:00",
      services: ["ترخيص المدارس", "متابعة المناهج", "تدريب المعلمين", "تطوير التعليم"],
      icon: GraduationCap,
      color: "bg-blue-500"
    },
    {
      title: "إدارة التعليم العالي",
      description: "الإدارة المسؤولة عن التعليم العالي والجامعات",
      phone: "01234567891",
      address: "ميدان التعليم العالي، حدائق أكتوبر",
      hours: "السبت - الخميس: 8:00 - 15:00",
      services: ["ترخيص الجامعات", "متابعة الكليات", "تطوير المناهج", "البحث العلمي"],
      icon: BookOpen,
      color: "bg-green-500"
    },
    {
      title: "مركز التدريب والتطوير",
      description: "مركز تدريب المعلمين والكوادر التعليمية",
      phone: "01234567892",
      address: "شارع التدريب، حدائق أكتوبر",
      hours: "السبت - الخميس: 8:00 - 17:00",
      services: ["تدريب المعلمين", "ورش عمل", "دورات تطويرية", "شهادات مهنية"],
      icon: Award,
      color: "bg-purple-500"
    },
    {
      title: "إدارة شؤون الطلاب",
      description: "الإدارة المسؤولة عن شؤون الطلاب والخدمات التعليمية",
      phone: "01234567893",
      address: "شارع شؤون الطلاب، حدائق أكتوبر",
      hours: "السبت - الخميس: 8:00 - 16:00",
      services: ["المنح الدراسية", "الخدمات الطلابية", "الأنشطة الطلابية", "الدعم الأكاديمي"],
      icon: Users,
      color: "bg-orange-500"
    }
  ];

  const handleContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleLocation = (address: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/educational-services')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">الإدارة التعليمية</h1>
            <p className="text-muted-foreground">إدارة التعليم والتعليم العالي في المدينة</p>
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800">معلومات مهمة</h3>
                <p className="text-blue-700 text-sm mt-1">
                  الإدارة التعليمية مسؤولة عن تطوير وتنظيم التعليم في المدينة. جميع الخدمات التعليمية متاحة للمدارس والطلاب والمعلمين.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educationDepartmentServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${service.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.hours}</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">الخدمات المتاحة:</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.services.map((serviceItem, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {serviceItem}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleContact(service.phone)}
                      size="sm"
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      اتصل
                    </Button>
                    <Button
                      onClick={() => handleLocation(service.address)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      الموقع
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">الخدمات الإلكترونية:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• تسجيل المدارس الجديدة</li>
                  <li>• متابعة المناهج الدراسية</li>
                  <li>• تدريب المعلمين</li>
                  <li>• خدمات الطلاب</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">المستندات المطلوبة:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• ترخيص المدرسة</li>
                  <li>• شهادات المعلمين</li>
                  <li>• خطة المناهج</li>
                  <li>• تقارير الأداء</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EducationalServicesEducationDepartment;
