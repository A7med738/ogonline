import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, ArrowRight, Building, Users, Wrench, Banknote } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
interface CityDepartment {
  id: string;
  title: string;
  description?: string;
  phone: string;
  email: string;
  hours: string;
  icon: string;
  color: string;
  order_priority?: number;
}

// Icon mapping for lucide icons
const iconMap: {
  [key: string]: React.ComponentType<any>;
} = {
  Building,
  Users,
  Wrench,
  Banknote
};
const City = () => {
  const [departments, setDepartments] = useState<CityDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDepartments();
  }, []);
  const fetchDepartments = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('city_departments').select('*').order('order_priority', {
        ascending: true
      });
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching city departments:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };
  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };
  return <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Building className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">هيئة المدينة</h1>
          <p className="text-white/80 text-lg">
            تواصل مع إدارات المدينة المختلفة للحصول على الخدمات
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => window.history.back()} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        {/* Main Contact Info */}
        

        {/* Departments Grid */}
        {loading ? <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-white/80">جاري تحميل الإدارات...</p>
          </div> : departments.length === 0 ? <div className="text-center py-8">
            <p className="text-white/80">لا توجد إدارات متاحة حالياً</p>
          </div> : <div className="grid gap-6 max-w-4xl mx-auto">
            {departments.map((dept, index) => {
          const IconComponent = iconMap[dept.icon] || Building;
          return <GlassCard key={dept.id} className="animate-slide-up hover:scale-[1.02] transition-all duration-300" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className={`bg-gradient-to-r ${dept.color} p-3 rounded-xl shadow-elegant`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{dept.title}</h3>
                    <p className="text-muted-foreground">{dept.description}</p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-3 pr-16">
                  <div className="flex items-center space-x-2 space-x-reverse text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{dept.hours}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium">{dept.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{dept.email}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 space-x-reverse pt-2">
                  <Button onClick={() => handleCall(dept.phone)} className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 flex-1">
                    <Phone className="ml-2 h-4 w-4" />
                    اتصال
                  </Button>
                  <Button variant="outline" onClick={() => handleEmail(dept.email)} className="flex-1 border-primary/20 hover:bg-primary/10">
                    <Mail className="ml-2 h-4 w-4" />
                    بريد إلكتروني
                  </Button>
                  </div>
                </div>
              </GlassCard>;
        })}
          </div>}

        {/* Emergency Notice */}
        
      </div>
    </div>;
};
export default City;