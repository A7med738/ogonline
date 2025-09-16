import React, { useState, useEffect } from 'react';
import { Phone, MapPin, ArrowRight, Building, Users, Wrench, Banknote } from "lucide-react";
import octoberGardensLogo from "@/assets/october-gardens-logo.jpg";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
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
  google_maps_url?: string;
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

  return <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 w-16 h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center overflow-hidden">
            <img src={octoberGardensLogo} alt="شعار حدائق أكتوبر" className="w-full h-full object-cover rounded-full" />
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
          return <GlassCard key={dept.id} className="group relative overflow-hidden animate-slide-up hover:scale-[1.02] transition-all duration-500 border-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-card/90 dark:via-card/80 dark:to-card/70 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:shadow-primary/10" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                {/* Modern gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                
                {/* Content */}
                <div className="relative p-6">
                  {/* Header with modern design */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className={`bg-gradient-to-br ${dept.color} p-3 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{dept.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{dept.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone number with modern styling */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 mb-4 border border-green-200/50 dark:border-green-800/50">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="bg-green-500 p-2 rounded-lg shadow-sm">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">رقم الهاتف</p>
                        <p className="text-sm font-semibold text-foreground">{dept.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons with modern design */}
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      onClick={() => handleCall(dept.phone)} 
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-11 font-medium"
                    >
                      <Phone className="ml-2 h-4 w-4" /> 
                      اتصال
                    </Button>
                    {dept.google_maps_url && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.open(dept.google_maps_url, '_blank')} 
                        className="flex-1 border-2 border-green-500/30 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 hover:text-green-700 transition-all duration-300 rounded-xl h-11 font-medium"
                      >
                        <MapPin className="ml-2 h-4 w-4" /> 
                        الموقع
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