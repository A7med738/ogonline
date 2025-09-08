import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Trash2, MapPin, Calendar, User, Briefcase } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  job_type: string;
  location_description: string;
  contact_method: string;
  payment: string;
  employer_id: string;
  is_active: boolean;
  expires_at: string;
  status: string;
  moderation_status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    phone: string;
  } | null;
}

export const JobsManagement = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles!employer_id(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data as any) || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الوظائف",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'job_deletion',
          target_type: 'job',
          target_id: id,
          description: 'حذف إعلان وظيفة',
          metadata: { action: 'delete' }
        });

      setJobs(prev => prev.filter(job => job.id !== id));
      
      toast({
        title: "تم بنجاح",
        description: "تم حذف إعلان الوظيفة",
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف إعلان الوظيفة",
        variant: "destructive"
      });
    }
  };

  const toggleJobStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setJobs(prev => prev.map(job => 
        job.id === id ? { ...job, is_active: !currentStatus } : job
      ));
      
      toast({
        title: "تم بنجاح",
        description: !currentStatus ? "تم تفعيل الإعلان" : "تم إيقاف الإعلان",
      });
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تغيير حالة الإعلان",
        variant: "destructive"
      });
    }
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full-time': 'دوام كامل',
      'part-time': 'دوام جزئي',
      'contract': 'تعاقد',
      'temporary': 'مؤقت',
      'internship': 'تدريب',
      'freelance': 'عمل حر'
    };
    return types[type] || type;
  };

  const getStatusBadgeVariant = (status: string, isActive: boolean) => {
    if (!isActive) return 'secondary';
    switch (status) {
      case 'published': return 'default';
      case 'pending': return 'outline';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  const isExpired = (expiresAt: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">إدارة إعلانات التوظيف</h3>
        <Badge variant="outline" className="text-sm">
          إجمالي الإعلانات: {jobs.length}
        </Badge>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card className="p-8 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد إعلانات وظائف</p>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <h4 className="font-medium text-lg">{job.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getStatusBadgeVariant(job.status, job.is_active)}>
                        {job.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <Badge variant="outline">
                        {getJobTypeLabel(job.job_type)}
                      </Badge>
                      {job.moderation_status && (
                        <Badge variant={job.moderation_status === 'approved' ? 'default' : 'destructive'}>
                          {job.moderation_status === 'approved' ? 'مقبول' : job.moderation_status}
                        </Badge>
                      )}
                      {job.expires_at && isExpired(job.expires_at) && (
                        <Badge variant="destructive">منتهي الصلاحية</Badge>
                      )}
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {job.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {job.location_description && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{job.location_description}</span>
                      </div>
                    )}
                    
                    {job.payment && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">الراتب:</span>
                        <span className="font-medium">{job.payment}</span>
                      </div>
                    )}

                    {job.profiles?.full_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{job.profiles.full_name}</span>
                      </div>
                    )}

                    {job.profiles?.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">الهاتف:</span>
                        <span className="font-medium">{job.profiles.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    {job.expires_at && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">ينتهي:</span>
                        <span className="text-muted-foreground">
                          {new Date(job.expires_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    )}
                  </div>

                  {job.contact_method && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <span className="font-medium">طريقة التواصل: </span>
                      {job.contact_method}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full sm:w-auto lg:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleJobStatus(job.id, job.is_active)}
                    className="w-full sm:w-auto"
                  >
                    {job.is_active ? 'إيقاف' : 'تفعيل'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(job.id)}
                    className="flex items-center justify-center gap-1 w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};