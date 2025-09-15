import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, MapPin, Users, Phone, DollarSign, Calendar, Clock, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SchoolTransportRequest {
  id: string;
  user_id: string;
  type: 'request' | 'offer';
  from_location: string;
  to_location: string;
  number_of_children: number;
  contact_number: string;
  price?: number;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const SchoolTransport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<SchoolTransportRequest[]>([]);
  const [offers, setOffers] = useState<SchoolTransportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: requestsData, error: requestsError } = await (supabase as any)
        .from('school_transport_requests')
        .select('*')
        .eq('type', 'request')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const { data: offersData, error: offersError } = await (supabase as any)
        .from('school_transport_requests')
        .select('*')
        .eq('type', 'offer')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      if (offersError) throw offersError;

      setRequests(requestsData || []);
      setOffers(offersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContact = (contactNumber: string) => {
    window.open(`tel:${contactNumber}`, '_self');
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('school_transport_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('تم حذف الدورة بنجاح');
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error deleting transport request:', error);
      toast.error('حدث خطأ أثناء حذف الدورة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/city-services')}
            className="flex items-center gap-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">العودة</span>
          </Button>
           <div className="min-w-0 flex-1">
             <h1 className="text-xl sm:text-2xl font-bold text-foreground">دورات المدينة</h1>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
          <Button
            onClick={() => navigate('/services/school-transport/request')}
            className="flex items-center justify-center gap-2 flex-1"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm sm:text-base">طلب دورة جديدة</span>
          </Button>
          <Button
            onClick={() => navigate('/services/school-transport/offer')}
            variant="outline"
            className="flex items-center justify-center gap-2 flex-1"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm sm:text-base">عرض دورة متاحة</span>
          </Button>
          {user && (
            <Button
              onClick={() => navigate('/services/school-transport/my-transports')}
              variant="secondary"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Edit className="h-4 w-4" />
              <span className="text-sm sm:text-base">دوراتي</span>
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">طلبات الدورات</TabsTrigger>
            <TabsTrigger value="offers">الدورات المتاحة</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <div className="grid gap-4">
              {requests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد طلبات دورات حالياً</p>
                  </CardContent>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">طلب دورة مدرسية</CardTitle>
                          <CardDescription className="mt-1">
                            {request.description || 'طلب دورة مدرسية'}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">طلب</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">
                            من: {request.from_location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">
                            إلى: {request.to_location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">
                            عدد الأطفال: {request.number_of_children}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleContact(request.contact_number)}
                            className="flex items-center gap-2 flex-1 sm:flex-none"
                            size="sm"
                          >
                            <Phone className="h-4 w-4" />
                            <span className="hidden sm:inline">تواصل</span>
                            <span className="sm:hidden">اتصال</span>
                          </Button>
                          {user && user.id === request.user_id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="flex items-center gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">حذف</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(request.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
                          {request.contact_number}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="offers" className="mt-6">
            <div className="grid gap-4">
              {offers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد دورات متاحة حالياً</p>
                  </CardContent>
                </Card>
              ) : (
                offers.map((offer) => (
                  <Card key={offer.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">دورة متاحة</CardTitle>
                          <CardDescription className="mt-1">
                            {offer.description || 'دورة مدرسية متاحة'}
                          </CardDescription>
                        </div>
                        <Badge variant="default">متاح</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">
                            من: {offer.from_location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">
                            إلى: {offer.to_location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">
                            عدد الأطفال المطلوب: {offer.number_of_children}
                          </span>
                        </div>
                        {offer.price && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm">
                              السعر: {offer.price} جنيه
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">
                            {formatDate(offer.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleContact(offer.contact_number)}
                            className="flex items-center gap-2 flex-1 sm:flex-none"
                            size="sm"
                          >
                            <Phone className="h-4 w-4" />
                            <span className="hidden sm:inline">تواصل</span>
                            <span className="sm:hidden">اتصال</span>
                          </Button>
                          {user && user.id === offer.user_id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="flex items-center gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">حذف</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(offer.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
                          {offer.contact_number}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SchoolTransport;
