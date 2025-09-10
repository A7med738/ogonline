import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, MapPin, Users, Phone, DollarSign, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
      const { data: requestsData, error: requestsError } = await supabase
        .from('school_transport_requests')
        .select('*')
        .eq('type', 'request')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const { data: offersData, error: offersError } = await supabase
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
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">دورات المدارس</h1>
            <p className="text-muted-foreground">ابحث عن دورات مدرسية أو أضف طلبك</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => navigate('/services/school-transport/request')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            طلب دورة جديدة
          </Button>
          <Button
            onClick={() => navigate('/services/school-transport/offer')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            عرض دورة متاحة
          </Button>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            من: {request.from_location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            إلى: {request.to_location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            عدد الأطفال: {request.number_of_children}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <Button
                          onClick={() => handleContact(request.contact_number)}
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          تواصل
                        </Button>
                        <span className="text-sm text-muted-foreground">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            من: {offer.from_location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            إلى: {offer.to_location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            عدد الأطفال المطلوب: {offer.number_of_children}
                          </span>
                        </div>
                        {offer.price && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              السعر: {offer.price} ريال
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(offer.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <Button
                          onClick={() => handleContact(offer.contact_number)}
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          تواصل
                        </Button>
                        <span className="text-sm text-muted-foreground">
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
