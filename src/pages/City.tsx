import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, ArrowRight, Building, Users, Wrench, Banknote, Navigation } from "lucide-react";
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
  }, []);
  useEffect(() => {
    if (user?.id) {
      checkAdminRole();
    } else {
      setIsAdmin(false);
    }
  }, [user?.id]);
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
    if (!user?.id) return;
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
      <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
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
          </div> : <div className="grid gap-2 md:gap-4 max-w-full md:max-w-4xl mx-auto">
            {departments.map((dept, index) => {
          const IconComponent = iconMap[dept.icon] || Building;
          return <GlassCard key={dept.id} className="relative overflow-hidden animate-slide-up hover:scale-[1.01] transition-all duration-300 border border-white/10 bg-white/70 dark:bg-card/80 backdrop-blur shadow-sm hover:shadow-md" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-primary/60 to-primary/10" />
                <div className="space-y-2 md:space-y-3 p-2 md:p-3">
                  {/* Header */}
                  <div className="flex items-center space-x-2.5 space-x-reverse md:space-x-4">
                    <div className={`bg-gradient-to-r ${dept.color} p-1.5 md:p-3 rounded-lg md:rounded-xl shadow-elegant`}>
                      <IconComponent className="h-3.5 w-3.5 md:h-5 md:w-5 text-foreground" />
                    </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base md:text-xl font-bold text-foreground line-clamp-1">{dept.title}</h3>
                      <span className="hidden md:inline-block text-xs text-muted-foreground whitespace-nowrap">{dept.hours}</span>
                    </div>
                    <p className="mt-0.5 text-xs md:text-sm text-muted-foreground line-clamp-2">{dept.description}</p>
                  </div>
                  {/* Delete icon removed from public page; available in Admin panel only */}
                  {/* Location visibility toggle moved to Admin panel */}
                </div>

                {/* Contact Details */}
                <div className="h-px bg-border/60 my-1 md:my-2" />
                <div className="grid grid-cols-1 gap-1.5 md:grid-cols-3 md:gap-3 pr-4 md:pr-12">
                  <div className="flex items-center space-x-2 space-x-reverse text-xs md:text-sm">
                    <div className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary h-6 w-6">
                      <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                    <span className="text-muted-foreground line-clamp-1">{dept.hours}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse text-xs md:text-sm">
                    <div className="inline-flex items-center justify-center rounded-md bg-green-500/10 text-green-600 h-6 w-6">
                      <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                    <span className="text-foreground font-medium line-clamp-1">{dept.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse text-xs md:text-sm">
                    <div className="inline-flex items-center justify-center rounded-md bg-blue-500/10 text-blue-600 h-6 w-6">
                      <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                    <span className="text-foreground line-clamp-1">{dept.email}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5 pt-2">
                  <Button size="sm" onClick={() => handleCall(dept.phone)} className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 flex-1">
                    <Phone className="ml-2 h-4 w-4" /> اتصال
                  </Button>
                  {hasValidLocation(dept.latitude, dept.longitude) && (dept.show_location !== false) && (
                    <Button size="sm" variant="outline" onClick={() => handleGetDirections(dept)} className="flex-1 border-primary/20 hover:bg-primary/10">
                      <Navigation className="ml-2 h-4 w-4" /> موقع
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