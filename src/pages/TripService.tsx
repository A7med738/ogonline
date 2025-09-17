import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, MapPin, Users, Phone, DollarSign, Calendar, Clock, Trash2, Edit, Bus, Car, Truck, Bike, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  stations?: TripStation[];
  passengers?: TripPassenger[];
}

interface TripStation {
  id: string;
  trip_id: string;
  station_name: string;
  station_order: number;
  latitude?: number;
  longitude?: number;
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

const TripService = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVehicle, setFilterVehicle] = useState('all');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      // First try to get trips without relations to avoid policy issues
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'active')
        .order('departure_time', { ascending: true });

      if (tripsError) throw tripsError;

      // For now, set trips without relations to avoid policy recursion
      setTrips(tripsData || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('حدث خطأ أثناء تحميل الرحلات');
      setTrips([]); // Set empty array on error
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

  const handleContact = (contactNumber: string) => {
    window.open(`tel:${contactNumber}`, '_self');
  };

  const handleJoinTrip = async (tripId: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    // Navigate to trip registration page
    navigate(`/trip-service/join/${tripId}`);
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

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.to_location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || trip.trip_type === filterType;
    const matchesVehicle = filterVehicle === 'all' || trip.vehicle_type === filterVehicle;
    
    return matchesSearch && matchesType && matchesVehicle;
  });

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
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">توصيلة</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
          <Button
            onClick={() => navigate('/trip-service/create')}
            className="flex items-center justify-center gap-2 flex-1"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm sm:text-base">إضافة رحلة جديدة</span>
          </Button>
          {user && (
            <Button
              onClick={() => navigate('/trip-service/my-trips')}
              variant="secondary"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <Edit className="h-4 w-4" />
              <span className="text-sm sm:text-base">رحلاتي</span>
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في الرحلات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="نوع الرحلة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="regular">عادية</SelectItem>
              <SelectItem value="school">مدرسية</SelectItem>
              <SelectItem value="work">عمل</SelectItem>
              <SelectItem value="event">فعالية</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterVehicle} onValueChange={setFilterVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="نوع المركبة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المركبات</SelectItem>
              <SelectItem value="car">سيارة</SelectItem>
              <SelectItem value="van">فان</SelectItem>
              <SelectItem value="bus">حافلة</SelectItem>
              <SelectItem value="motorcycle">دراجة نارية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trips List */}
        <div className="grid gap-4">
          {filteredTrips.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد رحلات متاحة حالياً</p>
              </CardContent>
            </Card>
          ) : (
            filteredTrips.map((trip) => {
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
                        <Badge variant={isFull ? "destructive" : "default"}>
                          {isFull ? "مكتملة" : `${trip.current_passengers}/${trip.max_passengers}`}
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

                    {/* Stations */}
                    {trip.stations && trip.stations.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">المحطات:</p>
                        <div className="flex flex-wrap gap-1">
                          {trip.stations
                            .sort((a, b) => a.station_order - b.station_order)
                            .map((station, index) => (
                            <Badge key={station.id} variant="outline" className="text-xs">
                              {station.station_name}
                              {station.pickup_time && (
                                <span className="mr-1">({formatTime(station.pickup_time)})</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Passengers */}
                    {trip.passengers && trip.passengers.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">الركاب المسجلين ({trip.passengers.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {trip.passengers.slice(0, 3).map((passenger) => (
                            <Badge key={passenger.id} variant="secondary" className="text-xs">
                              {passenger.passenger_name}
                            </Badge>
                          ))}
                          {trip.passengers.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{trip.passengers.length - 3} آخرين
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

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
                        {!isFull && (
                          <Button
                            onClick={() => handleJoinTrip(trip.id)}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">انضم للرحلة</span>
                            <span className="sm:hidden">انضم</span>
                          </Button>
                        )}
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
      </div>
    </div>
  );
};

export default TripService;
