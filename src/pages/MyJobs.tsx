import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Play, Pause, Trash2, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type JobStatus = 'draft' | 'published' | 'paused' | 'expired';

interface Job {
  id: string;
  title: string;
  description: string;
  job_type: string;
  location_description: string;
  payment: string | null;
  contact_method: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const MyJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadMyJobs();
    }
  }, [user]);

  const loadMyJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعلانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: JobStatus) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));

      toast({
        title: "تم بنجاح",
        description: "تم تحديث حالة الإعلان",
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الإعلان",
        variant: "destructive"
      });
    }
  };

  const extendJob = async (jobId: string) => {
    try {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30); // تمديد لـ 30 يوم

      const { error } = await supabase
        .from('jobs')
        .update({ 
          expires_at: newExpiryDate.toISOString(),
          status: 'published'
        })
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, expires_at: newExpiryDate.toISOString(), status: 'published' as JobStatus } 
          : job
      ));

      toast({
        title: "تم بنجاح",
        description: "تم تمديد الإعلان لـ 30 يوم",
      });
    } catch (error) {
      console.error('Error extending job:', error);
      toast({
        title: "خطأ",
        description: "فشل في تمديد الإعلان",
        variant: "destructive"
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.filter(job => job.id !== jobId));

      toast({
        title: "تم بنجاح",
        description: "تم حذف الإعلان",
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الإعلان",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      draft: { label: 'مسودة', variant: 'secondary' },
      published: { label: 'منشورة', variant: 'default' },
      paused: { label: 'موقوفة', variant: 'outline' },
      expired: { label: 'منتهية', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredJobs = filterStatus === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filterStatus);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">يجب تسجيل الدخول لعرض إعلاناتك</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8">
      <div className="container mx-auto px-4">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">إعلاناتي</h1>
            <p className="text-muted-foreground">إدارة إعلاناتك الوظيفية</p>
          </div>
          <Button onClick={() => navigate('/jobs')}>
            إضافة إعلان جديد
          </Button>
        </div>

        <div className="mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="فلترة حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الإعلانات</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="published">منشورة</SelectItem>
              <SelectItem value="paused">موقوفة</SelectItem>
              <SelectItem value="expired">منتهية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {filterStatus === 'all' ? 'لا توجد إعلانات' : `لا توجد إعلانات ${filterStatus === 'draft' ? 'مسودة' : filterStatus === 'published' ? 'منشورة' : filterStatus === 'paused' ? 'موقوفة' : 'منتهية'}`}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-muted-foreground mb-2">{job.description}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>الموقع: {job.location_description}</p>
                      {job.payment && <p>المقابل: {job.payment}</p>}
                      <p>التواصل: {job.contact_method}</p>
                      {job.expires_at && (
                        <p>ينتهي في: {new Date(job.expires_at).toLocaleDateString('ar-EG')}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/jobs/edit/${job.id}`)}
                  >
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>

                  {job.status === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateJobStatus(job.id, 'paused' as JobStatus)}
                    >
                      <Pause className="h-4 w-4 ml-1" />
                      إيقاف
                    </Button>
                  )}

                  {(job.status === 'paused' || job.status === 'draft') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateJobStatus(job.id, 'published' as JobStatus)}
                    >
                      <Play className="h-4 w-4 ml-1" />
                      نشر
                    </Button>
                  )}

                  {(job.status === 'expired' || job.expires_at) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => extendJob(job.id)}
                    >
                      <Calendar className="h-4 w-4 ml-1" />
                      تمديد
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    معاينة
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 ml-1" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteJob(job.id)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;