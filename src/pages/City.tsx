import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, ArrowRight, Building, Users, Wrench, Banknote, Navigation, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { openGoogleMapsDirections, hasValidLocation } from '@/utils/mapUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';
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
  latitude?: number;
  longitude?: number;
  show_location?: boolean;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    fetchDepartments();
    checkAdminRole();
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
  const checkAdminRole = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  };
  const handleDeleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase.from('city_departments').delete().eq('id', id);
      if (error) throw error;
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error('Failed to delete department', e);
    }
  };
  const handleToggleDepartmentLocation = async (dept: CityDepartment) => {
    const next = dept.show_location === false ? true : false;
    try {
      const { error } = await supabase.from('city_departments').update({ show_location: next } as any).eq('id', dept.id);
      if (error) throw error;
      setDepartments(prev => prev.map(d => d.id === dept.id ? { ...d, show_location: next } : d));
    } catch (e) {
      console.error('Failed to toggle location visibility', e);
    }
  };
  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };
  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleGetDirections = (department: CityDepartment) => {
    if (hasValidLocation(department.latitude, department.longitude)) {
      openGoogleMapsDirections(
        department.latitude!,
        department.longitude!,
        department.title
      );
    }
  };
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 py-5 md:px-4 md:py-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 w-16 h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
            <Building className="h-8 w-8 text-foreground" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">جهاز المدينة</h3>
          
        </div>


        {/* Main Contact Info */}
        

        {/* Departments Grid */}
        {loading ? <div className="text-center py-6 md:py-8">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">جاري تحميل الإدارات...</p>
          </div> : departments.length === 0 ? <div className="text-center py-6 md:py-8">
            <p className="text-muted-foreground">لا توجد إدارات متاحة حالياً</p>
          </div> : <div className="grid gap-2.5 md:gap-5 max-w-4xl mx-auto">
            {departments.map((dept, index) => {
          const IconComponent = iconMap[dept.icon] || Building;
          return <GlassCard key={dept.id} className="animate-slide-up hover:scale-[1.01] transition-all duration-300" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="space-y-2.5 md:space-y-3.5">
                  {/* Header */}
                  <div className="flex items-center space-x-2.5 space-x-reverse md:space-x-4">
                    <div className={`bg-gradient-to-r ${dept.color} p-1.5 md:p-3 rounded-lg md:rounded-xl shadow-elegant`}>
                      <IconComponent className="h-3.5 w-3.5 md:h-5 md:w-5 text-foreground" />
                    </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-xl font-bold text-foreground">{dept.title}</h3>
                    <p className="text-xs md:text-base text-foreground/90 line-clamp-2">{dept.description}</p>
                  </div>
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف الإدارة</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف "{dept.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteDepartment(dept.id)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {/* Location visibility toggle moved to Admin panel */}
                </div>

                {/* Contact Details */}
                <div className="space-y-1.5 md:space-y-3 pr-10 md:pr-16">
                  <div className="flex items-center space-x-1.5 space-x-reverse text-xs md:text-sm">
                    <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    <span className="text-muted-foreground">{dept.hours}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5 space-x-reverse text-xs md:text-sm">
                    <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    <span className="text-foreground font-medium text-xs md:text-sm">{dept.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5 space-x-reverse text-xs md:text-sm">
                    <Mail className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    <span className="text-foreground text-xs md:text-sm">{dept.email}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-1.5 space-x-reverse pt-1 md:space-x-3 md:pt-2">
                  <Button size="sm" onClick={() => handleCall(dept.phone)} className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 flex-1">
                    <Phone className="ml-2 h-4 w-4" />
                    اتصال
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEmail(dept.email)} className="flex-1 border-primary/20 hover:bg-primary/10">
                    <Mail className="ml-2 h-4 w-4" />
                    بريد إلكتروني
                  </Button>
                  {hasValidLocation(dept.latitude, dept.longitude) && (dept.show_location !== false) && (
                    <Button size="sm" variant="outline" onClick={() => handleGetDirections(dept)} className="flex-1 border-primary/20 hover:bg-primary/10">
                      <Navigation className="ml-2 h-4 w-4" />
                      موقع
                    </Button>
                  )}
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