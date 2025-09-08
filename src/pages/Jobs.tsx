import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Briefcase, Search, MapPin, Phone, DollarSign, Clock, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "@/components/LocationPicker";

type UserType = 'employer' | 'job_seeker' | null;
type JobType = 'permanent' | 'temporary';

interface Job {
  id: string;
  title: string;
  description: string;
  job_type: string;
  location_description: string;
  latitude: number | null;
  longitude: number | null;
  payment: string | null;
  contact_method: string;
  created_at: string;
}

const jobFormSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  description: z.string().optional(),
  job_type: z.enum(['permanent', 'temporary']),
  location_description: z.string().min(1, "الموقع مطلوب"),
  payment: z.string().optional(),
  contact_method: z.string().min(1, "طريقة التواصل مطلوبة"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userType, setUserType] = useState<UserType>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{latitude: number, longitude: number} | null>(null);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      job_type: 'permanent',
    }
  });

  useEffect(() => {
    if (userType === 'job_seeker') {
      loadJobs();
    }
  }, [userType]);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الوظائف",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: JobFormData) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          title: data.title,
          description: data.description,
          job_type: data.job_type,
          location_description: data.location_description,
          payment: data.payment,
          contact_method: data.contact_method,
          employer_id: user.id,
          latitude: selectedLocation?.latitude || null,
          longitude: selectedLocation?.longitude || null,
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم نشر الوظيفة بنجاح",
      });

      form.reset();
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "خطأ",
        description: "فشل في نشر الوظيفة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-background pt-8">
        <div className="container mx-auto px-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-6 p-0 h-auto"
          >
            <ArrowLeft className="h-5 w-5 ml-2" />
            العودة
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">الوظائف والفرص</h1>
            <p className="text-muted-foreground">اختر نوع المستخدم للمتابعة</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => setUserType('employer')}
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-xl font-semibold mb-2">صاحب العمل</h3>
                  <p className="text-muted-foreground">أبحث عن موظف أو عامل</p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => setUserType('job_seeker')}
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Search className="h-8 w-8 text-secondary" />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-xl font-semibold mb-2">باحث عن عمل</h3>
                  <p className="text-muted-foreground">أبحث عن فرصة عمل</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'employer') {
    return (
      <div className="min-h-screen bg-background pt-8">
        <div className="container mx-auto px-4">
          <Button
            onClick={() => setUserType(null)}
            variant="ghost"
            className="mb-6 p-0 h-auto"
          >
            <ArrowLeft className="h-5 w-5 ml-2" />
            العودة
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">إضافة فرصة عمل</h1>
            <p className="text-muted-foreground">أضف تفاصيل الوظيفة المطلوبة</p>
          </div>

          <Card className="max-w-2xl mx-auto p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="job_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الفرصة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الوظيفة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="permanent">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Building className="h-4 w-4" />
                              <span>وظيفة دائمة</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="temporary">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Clock className="h-4 w-4" />
                              <span>فرصة مؤقتة (شُغلانة يوم)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: مطلوب كهربائي، محاسب لمحل تجاري" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف (اختياري)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="تفاصيل بسيطة ومباشرة عن المطلوب" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموقع</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="وصف الموقع (مثال: حدائق أكتوبر، المنطقة الأولى)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>تحديد الموقع على الخريطة (اختياري)</Label>
                  <LocationPicker
                    latitude={selectedLocation?.latitude}
                    longitude={selectedLocation?.longitude}
                    onLocationSelect={(lat, lng) => setSelectedLocation({ latitude: lat, longitude: lng })}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المقابل المادي (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: 3000 جنيه شهرياً، 200 جنيه يومياً" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>طريقة التواصل</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="رقم هاتف أو طريقة التواصل المفضلة" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "جاري النشر..." : "نشر الوظيفة"}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    );
  }

  if (userType === 'job_seeker') {
    return (
      <div className="min-h-screen bg-background pt-8">
        <div className="container mx-auto px-4">
          <Button
            onClick={() => setUserType(null)}
            variant="ghost"
            className="mb-6 p-0 h-auto"
          >
            <ArrowLeft className="h-5 w-5 ml-2" />
            العودة
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">الوظائف المتاحة</h1>
            <p className="text-muted-foreground">تصفح الفرص المتاحة في منطقتك</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {jobs.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">لا توجد وظائف متاحة حالياً</p>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mb-2">
                          {job.job_type === 'permanent' ? (
                            <Building className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          <span>{job.job_type === 'permanent' ? 'وظيفة دائمة' : 'فرصة مؤقتة'}</span>
                        </div>
                      </div>
                    </div>

                    {job.description && (
                      <p className="text-muted-foreground">{job.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{job.location_description}</span>
                      </div>

                      {job.payment && (
                        <div className="flex items-center space-x-2 space-x-reverse text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{job.payment}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 space-x-reverse text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{job.contact_method}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString('ar-EG')}
                      </span>
                      <Button variant="outline" size="sm">
                        تواصل الآن
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Jobs;