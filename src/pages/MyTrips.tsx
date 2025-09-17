import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Users, Phone, DollarSign, Clock, Trash2, Edit, Bus, Car, Truck, Bike, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Trip {
  id: string;
  driver_id: string;
  title: string;
  description?: string;
  from_location: string;
  to_location: string;
  departure_time: string;
  arrival_time?: string;
  price?: number;
  max_passengers: number;
  current_passengers: number;
  status: string;
  trip_type: string;
  vehicle_type: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
  passengers?: TripPassenger[];
}

interface TripPassenger {
  id: string;
  trip_id: string;
  passenger_id?: string;
  passenger_name: string;
  passenger_phone: string;
  pickup_station_id?: string;
  dropoff_station_id?: string;
  status: string;
  registered_at: string;
  notes?: string;
}

const MyTrips = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [myPassengerTrips, setMyPassengerTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyTrips();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyTrips = async () => {
    try {
      // Get trips I created (as driver)
      const { data: driverTrips, error: driverError } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', user?.id)
        .order('created_at', { ascending: false });

      if (driverError) throw driverError;

      // Get trips I'm registered as passenger
      const { data: passengerTrips, error: passengerError } = await supabase
        .from('trip_passengers')
        .select(`
          trip_id,
          trips (*)
        `)
        .eq('passenger_id', user?.id)
        .eq('status', 'confirmed');

      if (passengerError) throw passengerError;

      const passengerTripsData = passengerTrips?.map(p => p.trips).filter(Boolean) as Trip[] || [];

      setMyTrips(driverTrips || []);
      setMyPassengerTrips(passengerTripsData);
    } catch (error) {
      console.error('Error fetching my trips:', error);
      toast.error('حدث خطأ أثناء تحميل الرحلات');
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

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
        .eq('driver_id', user?.id);

      if (error) throw error;

      toast.success('تم حذف الرحلة بنجاح');
      fetchMyTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('حدث خطأ أثناء حذف الرحلة');
    }
  };

  const handleCancelRegistration = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trip_passengers')
        .update({ status: 'cancelled' })
        .eq('trip_id', tripId)
        .eq('passenger_id', user?.id);

      if (error) throw error;

      toast.success('تم إلغاء التسجيل في الرحلة');
      fetchMyTrips();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('حدث خطأ أثناء إلغاء التسجيل');
    }
  };

  const handleContact = (contactNumber: string) => {
    window.open(`tel:${contactNumber}`, '_self');
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return Car;
      case 'van': return Bus;
      case 'bus': return Bus;
      case 'motorcycle': return Bike;
      default: return Car;
    }
  };

  const getTripTypeLabel = (type: string) => {
    switch (type) {
      case 'regular': return 'عادية';
      case 'school': return 'مدرسية';
      case 'work': return 'عمل';
      case 'event': return 'فعالية';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة';
      case 'completed': return 'مكتملة';
      case 'cancelled': return 'ملغية';
      case 'full': return 'مكتملة';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'full': return 'outline';
      default: return 'default';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">يجب تسجيل الدخول</h2>
          <p className="text-muted-foreground mb-4">يجب تسجيل الدخول لعرض رحلاتك</p>
          <Button onClick={() => navigate('/auth')}>
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate('/trip-service')}
            className="flex items-center gap-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">العودة</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">رحلاتي</h1>
            <p className="text-muted-foreground text-sm">إدارة رحلاتك كسائق وراكب</p>
          </div>
          <Button
            onClick={() => navigate('/trip-service/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">رحلة جديدة</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="driver" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="driver">رحلاتي كسائق ({myTrips.length})</TabsTrigger>
            <TabsTrigger value="passenger">رحلاتي كراكب ({myPassengerTrips.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="driver" className="mt-6">
            <div className="grid gap-4">
              {myTrips.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لم تنشئ أي رحلات بعد</p>
                    <Button 
                      onClick={() => navigate('/trip-service/create')}
                      className="mt-4"
                    >
                      إنشاء رحلة جديدة
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myTrips.map((trip) => {
                  const VehicleIcon = getVehicleIcon(trip.vehicle_type);
                  const isFull = trip.current_passengers >= trip.max_passengers;
                  
                  return (
                    <Card key={trip.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <VehicleIcon className="h-6 w-6 text-primary mt-1" />
                            <div>
                              <CardTitle className="text-lg">{trip.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {trip.description || `${trip.from_location} → ${trip.to_location}`}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={getStatusVariant(trip.status)}>
                              {getStatusLabel(trip.status)}
                            </Badge>
                            <Badge variant="outline">
                              {getTripTypeLabel(trip.trip_type)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">
                              من: {trip.from_location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">
                              إلى: {trip.to_location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm">
                              {formatTime(trip.departure_time)}
                            </span>
                          </div>
                          {trip.price && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm">
                                {trip.price} جنيه
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            الركاب: {trip.current_passengers}/{trip.max_passengers}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => navigate(`/trip-service/edit/${trip.id}`)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline">تعديل</span>
                            </Button>
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
                                    هل أنت متأكد من حذف هذه الرحلة؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTrip(trip.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
                            {trip.contact_number}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="passenger" className="mt-6">
            <div className="grid gap-4">
              {myPassengerTrips.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لم تسجل في أي رحلات بعد</p>
                    <Button 
                      onClick={() => navigate('/trip-service')}
                      className="mt-4"
                    >
                      تصفح الرحلات المتاحة
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myPassengerTrips.map((trip) => {
                  const VehicleIcon = getVehicleIcon(trip.vehicle_type);
                  
                  return (
                    <Card key={trip.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <VehicleIcon className="h-6 w-6 text-primary mt-1" />
                            <div>
                              <CardTitle className="text-lg">{trip.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {trip.description || `${trip.from_location} → ${trip.to_location}`}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant="default">مسجل</Badge>
                            <Badge variant="outline">
                              {getTripTypeLabel(trip.trip_type)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">
                              من: {trip.from_location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">
                              إلى: {trip.to_location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm">
                              {formatTime(trip.departure_time)}
                            </span>
                          </div>
                          {trip.price && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm">
                                {trip.price} جنيه
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleContact(trip.contact_number)}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Phone className="h-4 w-4" />
                              <span className="hidden sm:inline">تواصل</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="flex items-center gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">إلغاء التسجيل</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الإلغاء</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من إلغاء التسجيل في هذه الرحلة؟
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelRegistration(trip.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    إلغاء التسجيل
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
                            {trip.contact_number}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTrips;
