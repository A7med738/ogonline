import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Flag,
  BarChart3,
  Shield,
  Activity,
  Clock,
  MessageSquare,
  Briefcase,
  UserX,
  Building,
  Megaphone,
  Newspaper
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewsManagement } from "@/components/admin/NewsManagement";
import { PoliceStationsManagement } from "@/components/admin/PoliceStationsManagement";
import { CityDepartmentsManagement } from "@/components/admin/CityDepartmentsManagement";
import { AnnouncementsManagement } from "@/components/admin/AnnouncementsManagement";
import { JobsManagement } from "@/components/admin/JobsManagement";

interface ContentItem {
  id: string;
  title: string;
  type: 'news' | 'job' | 'comment';
  status: string;
  created_at: string;
  author?: string;
  moderation_status?: string;
}

interface UserReport {
  id: string;
  reporter_id: string;
  reported_content_type: string;
  reported_content_id: string;
  report_reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter?: any;
}

interface AdminStats {
  totalUsers: number;
  totalNews: number;
  totalJobs: number;
  totalComments: number;
  pendingReports: number;
  pendingModeration: number;
  todayActivity: number;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalNews: 0,
    totalJobs: 0,
    totalComments: 0,
    pendingReports: 0,
    pendingModeration: 0,
    todayActivity: 0
  });
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, activeTab]);

  const checkAdminAccess = async () => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (data) {
        setIsAdmin(true);
        loadDashboardData();
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load basic stats
      const [usersRes, newsRes, jobsRes, commentsRes, reportsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('news').select('id', { count: 'exact' }),
        supabase.from('jobs').select('id', { count: 'exact' }),
        supabase.from('news_comments').select('id', { count: 'exact' }),
        supabase.from('user_reports').select('id', { count: 'exact' }).eq('status', 'pending')
      ]);

      setStats(prev => ({
        ...prev,
        totalUsers: usersRes.count || 0,
        totalNews: newsRes.count || 0,
        totalJobs: jobsRes.count || 0,
        totalComments: commentsRes.count || 0,
        pendingReports: reportsRes.count || 0
      }));

      // Load content for moderation
      if (activeTab === 'moderation') {
        await loadContentForModeration();
      }

      // Load reports
      if (activeTab === 'reports') {
        await loadReports();
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadContentForModeration = async () => {
    try {
      const [newsRes, jobsRes] = await Promise.all([
        supabase
          .from('news')
          .select('id, title, created_at, moderation_status')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('jobs')
          .select('id, title, created_at, moderation_status')
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      const newsItems = (newsRes.data || []).map(item => ({
        ...item,
        type: 'news' as const,
        status: item.moderation_status || 'pending'
      }));

      const jobItems = (jobsRes.data || []).map(item => ({
        ...item,
        type: 'job' as const,
        status: item.moderation_status || 'pending'
      }));

      setContentItems([...newsItems, ...jobItems].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));

    } catch (error) {
      console.error('Error loading content for moderation:', error);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          *,
          reporter:profiles!reporter_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const moderateContent = async (contentId: string, contentType: string, action: 'approve' | 'reject' | 'spam') => {
    try {
      const table = contentType === 'news' ? 'news' : 'jobs';
      const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'spam';

      const { error: updateError } = await supabase
        .from(table)
        .update({ moderation_status: status })
        .eq('id', contentId);

      if (updateError) throw updateError;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user?.id,
          action_type: 'content_moderation',
          target_type: contentType,
          target_id: contentId,
          description: `${action} ${contentType}`,
          metadata: { action, contentType }
        });

      // Log moderation action
      await supabase
        .from('content_moderation')
        .insert({
          content_type: contentType,
          content_id: contentId,
          moderator_id: user?.id,
          action: action
        });

      setContentItems(prev => 
        prev.map(item => 
          item.id === contentId 
            ? { ...item, status }
            : item
        )
      );

      toast({
        title: "تم بنجاح",
        description: `تم ${action === 'approve' ? 'الموافقة على' : action === 'reject' ? 'رفض' : 'وضع علامة سبام على'} المحتوى`,
      });

    } catch (error) {
      console.error('Error moderating content:', error);
      toast({
        title: "خطأ",
        description: "فشل في معالجة المحتوى",
        variant: "destructive"
      });
    }
  };

  const handleReport = async (reportId: string, action: 'reviewed' | 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({
          status: action,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user?.id,
          action_type: 'report_handling',
          target_type: 'report',
          target_id: reportId,
          description: `${action} user report`,
          metadata: { action }
        });

      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: action }
            : report
        )
      );

      toast({
        title: "تم بنجاح",
        description: "تم تحديث حالة البلاغ",
      });

    } catch (error) {
      console.error('Error handling report:', error);
      toast({
        title: "خطأ",
        description: "فشل في معالجة البلاغ",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      pending: { label: 'في الانتظار', variant: 'outline' },
      approved: { label: 'مقبول', variant: 'default' },
      rejected: { label: 'مرفوض', variant: 'destructive' },
      spam: { label: 'سبام', variant: 'destructive' },
      reviewed: { label: 'تمت المراجعة', variant: 'secondary' },
      resolved: { label: 'تم الحل', variant: 'default' },
      dismissed: { label: 'تم الرفض', variant: 'outline' }
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getReportReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      spam: 'سبام',
      inappropriate: 'محتوى غير مناسب',
      harassment: 'تحرش',
      fake_news: 'أخبار كاذبة',
      other: 'أخرى'
    };
    return reasons[reason] || reason;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">غير مصرح</h2>
          <p className="text-muted-foreground">ليس لديك صلاحيات إدارية للوصول لهذه الصفحة</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة الإدارة</h1>
          <p className="text-muted-foreground">إدارة ومراقبة محتوى التطبيق</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${activeTab === 'overview' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium">نظرة عامة</span>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${activeTab === 'moderation' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('moderation')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <Shield className="h-8 w-8 text-green-600" />
              <span className="text-sm font-medium">مراجعة المحتوى</span>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${activeTab === 'reports' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <Flag className="h-8 w-8 text-red-600" />
              <span className="text-sm font-medium">التقارير</span>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${activeTab === 'news' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <Newspaper className="h-8 w-8 text-purple-600" />
              <span className="text-sm font-medium">الأخبار</span>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${activeTab === 'police' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('police')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <Shield className="h-8 w-8 text-indigo-600" />
              <span className="text-sm font-medium">مراكز الشرطة</span>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${activeTab === 'departments' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <Building className="h-8 w-8 text-orange-600" />
              <span className="text-sm font-medium">أجهزة المدينة</span>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${activeTab === 'announcements' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <Megaphone className="h-8 w-8 text-pink-600" />
              <span className="text-sm font-medium">الإعلانات</span>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${activeTab === 'jobs' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <Briefcase className="h-8 w-8 text-teal-600" />
              <span className="text-sm font-medium">الوظائف</span>
            </div>
          </Card>
        </div>

        <div>
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="mr-4">
                      <p className="text-sm font-medium text-muted-foreground">إجمالي المستخدمين</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="mr-4">
                      <p className="text-sm font-medium text-muted-foreground">الأخبار</p>
                      <p className="text-2xl font-bold">{stats.totalNews}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <Briefcase className="h-8 w-8 text-purple-600" />
                    <div className="mr-4">
                      <p className="text-sm font-medium text-muted-foreground">الوظائف</p>
                      <p className="text-2xl font-bold">{stats.totalJobs}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-orange-600" />
                    <div className="mr-4">
                      <p className="text-sm font-medium text-muted-foreground">التعليقات</p>
                      <p className="text-2xl font-bold">{stats.totalComments}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600 ml-2" />
                    <h3 className="text-lg font-semibold">البلاغات المعلقة</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{stats.pendingReports}</p>
                  <p className="text-sm text-muted-foreground mt-2">يتطلب مراجعة فورية</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-yellow-600 ml-2" />
                    <h3 className="text-lg font-semibold">المحتوى في الانتظار</h3>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingModeration}</p>
                  <p className="text-sm text-muted-foreground mt-2">يحتاج موافقة</p>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">مراجعة المحتوى</h3>
              <div className="space-y-4">
                {contentItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">لا يوجد محتوى يحتاج مراجعة</p>
                ) : (
                  contentItems.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.type === 'news' ? 'خبر' : 'وظيفة'} • {new Date(item.created_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      {item.status === 'pending' && (
                        <div className="flex gap-2 pt-3 border-t">
                          <Button
                            size="sm"
                            onClick={() => moderateContent(item.id, item.type, 'approve')}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            موافقة
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moderateContent(item.id, item.type, 'reject')}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="h-4 w-4" />
                            رفض
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => moderateContent(item.id, item.type, 'spam')}
                            className="flex items-center gap-1"
                          >
                            <Flag className="h-4 w-4" />
                            سبام
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {activeTab === 'reports' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">البلاغات المرسلة</h3>
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">لا توجد بلاغات</p>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            بلاغ عن {report.reported_content_type === 'news' ? 'خبر' : 
                                     report.reported_content_type === 'job' ? 'وظيفة' : 
                                     report.reported_content_type === 'comment' ? 'تعليق' : 'مستخدم'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            السبب: {getReportReasonLabel(report.report_reason)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            المبلغ: {report.reporter?.full_name || 'غير معروف'} • {new Date(report.created_at).toLocaleDateString('ar-EG')}
                          </p>
                          {report.description && (
                            <p className="text-sm mt-2 p-2 bg-muted rounded">{report.description}</p>
                          )}
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      {report.status === 'pending' && (
                        <div className="flex gap-2 pt-3 border-t">
                          <Button
                            size="sm"
                            onClick={() => handleReport(report.id, 'reviewed')}
                          >
                            تمت المراجعة
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReport(report.id, 'resolved')}
                          >
                            تم الحل
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReport(report.id, 'dismissed')}
                          >
                            رفض البلاغ
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {activeTab === 'news' && <NewsManagement />}
          {activeTab === 'police' && <PoliceStationsManagement />}
          {activeTab === 'departments' && <CityDepartmentsManagement />}
          {activeTab === 'announcements' && <AnnouncementsManagement />}
          {activeTab === 'jobs' && <JobsManagement />}
        </div>
      </div>
    </div>
  );
};

export default Admin;