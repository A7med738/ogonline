import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Phone, DollarSign, Clock, Car, Bus, Truck, Bike, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  stations?: TripStation[];
  passengers?: TripPassenger[];
}

interface TripStation {
  id: string;
  trip_id: string;
  station_name: string;
  station_order: number;
  pickup_time?: string;
  dropoff_time?: string;
  is_pickup_only: boolean;
  is_dropoff_only: boolean;
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

const JoinTrip = () => {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_phone: '',
    pickup_station_id: '',
    dropoff_station_id: '',
    notes: ''
  });

  useEffect(() => {
    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          stations:trip_stations(*),
          passengers:trip_passengers(*)
        `)
        .eq('id', tripId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setTrip(data);
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('حدث خطأ أثناء تحميل الرحلة');
      navigate('/trip-service');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/auth');
      return;
    }

    if (!formData.passenger_name || !formData.passenger_phone) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!trip) {
      toast.error('الرحلة غير موجودة');
      return;
    }

    if (trip.current_passengers >= trip.max_passengers) {
      toast.error('الرحلة مكتملة');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('trip_passengers')
        .insert({
          trip_id: trip.id,
          passenger_id: user.id,
          passenger_name: formData.passenger_name,
          passenger_phone: formData.passenger_phone,
          pickup_station_id: formData.pickup_station_id || null,
          dropoff_station_id: formData.dropoff_station_id || null,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast.success('تم التسجيل في الرحلة بنجاح');
      navigate('/trip-service/my-trips');
    } catch (error) {
      console.error('Error joining trip:', error);
      toast.error('حدث خطأ أثناء التسجيل في الرحلة');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">الرحلة غير موجودة</h2>
          <p className="text-muted-foreground mb-4">الرحلة المطلوبة غير متاحة أو تم حذفها</p>
          <Button onClick={() => navigate('/trip-service')}>
            العودة للرحلات
          </Button>
        </div>
      </div>
    );
  }

  const VehicleIcon = getVehicleIcon(trip.vehicle_type);
  const isFull = trip.current_passengers >= trip.max_passengers;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">انضم للرحلة</h1>
            <p className="text-muted-foreground">سجل في هذه الرحلة المشتركة</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <VehicleIcon className="h-6 w-6 text-primary mt-1" />
                <div>
                  <CardTitle className="text-lg">{trip.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {trip.description || `${trip.from_location} → ${trip.to_location}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">
                    من: {trip.from_location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">
                    إلى: {trip.to_location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">
                    {formatTime(trip.departure_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">
                    {trip.current_passengers}/{trip.max_passengers} راكب
                  </span>
                </div>
              </div>

              {trip.price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">
                    السعر: {trip.price} جنيه مصري
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {getTripTypeLabel(trip.trip_type)}
                </Badge>
                <Badge variant={isFull ? "destructive" : "default"}>
                  {isFull ? "مكتملة" : "متاحة"}
                </Badge>
              </div>

              {/* Stations */}
              {trip.stations && trip.stations.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">المحطات:</p>
                  <div className="space-y-1">
                    {trip.stations
                      .sort((a, b) => a.station_order - b.station_order)
                      .map((station) => (
                      <div key={station.id} className="flex items-center justify-between text-xs bg-muted p-2 rounded">
                        <span>{station.station_name}</span>
                        {station.pickup_time && (
                          <span className="text-muted-foreground">
                            {formatTime(station.pickup_time)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={() => handleContact(trip.contact_number)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  تواصل مع السائق
                </Button>
                <span className="text-xs text-muted-foreground">
                  {trip.contact_number}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                بيانات التسجيل
              </CardTitle>
              <CardDescription>
                املأ البيانات التالية للتسجيل في الرحلة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFull ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">الرحلة مكتملة</p>
                  <p className="text-sm text-muted-foreground">
                    لا يمكن التسجيل في هذه الرحلة لأنها وصلت للحد الأقصى من الركاب
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passenger_name">الاسم الكامل *</Label>
                    <Input
                      id="passenger_name"
                      name="passenger_name"
                      value={formData.passenger_name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passenger_phone">رقم الهاتف *</Label>
                    <Input
                      id="passenger_phone"
                      name="passenger_phone"
                      value={formData.passenger_phone}
                      onChange={handleInputChange}
                      placeholder="05xxxxxxxx"
                      required
                    />
                  </div>

                  {trip.stations && trip.stations.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="pickup_station_id">محطة الاستلام (اختياري)</Label>
                        <Select value={formData.pickup_station_id} onValueChange={(value) => handleSelectChange('pickup_station_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر محطة الاستلام" />
                          </SelectTrigger>
                          <SelectContent>
                            {trip.stations
                              .filter(station => !station.is_dropoff_only)
                              .sort((a, b) => a.station_order - b.station_order)
                              .map((station) => (
                              <SelectItem key={station.id} value={station.id}>
                                {station.station_name}
                                {station.pickup_time && ` (${formatTime(station.pickup_time)})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dropoff_station_id">محطة النزول (اختياري)</Label>
                        <Select value={formData.dropoff_station_id} onValueChange={(value) => handleSelectChange('dropoff_station_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر محطة النزول" />
                          </SelectTrigger>
                          <SelectContent>
                            {trip.stations
                              .filter(station => !station.is_pickup_only)
                              .sort((a, b) => a.station_order - b.station_order)
                              .map((station) => (
                              <SelectItem key={station.id} value={station.id}>
                                {station.station_name}
                                {station.dropoff_time && ` (${formatTime(station.dropoff_time)})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="أي ملاحظات تريد إضافتها..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/trip-service')}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? 'جاري التسجيل...' : 'تسجيل في الرحلة'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JoinTrip;
