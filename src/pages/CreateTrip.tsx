import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Phone, DollarSign, Clock, Plus, Trash2, Car, Bus, Truck, Bike } from 'lucide-react';
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

interface Station {
  id: string;
  station_name: string;
  station_order: number;
  pickup_time: string;
  dropoff_time: string;
  is_pickup_only: boolean;
  is_dropoff_only: boolean;
}

const CreateTrip = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    from_location: '',
    to_location: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    max_passengers: '4',
    trip_type: 'regular',
    vehicle_type: 'car',
    contact_number: ''
  });

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

  const addStation = () => {
    const newStation: Station = {
      id: Date.now().toString(),
      station_name: '',
      station_order: stations.length + 1,
      pickup_time: '',
      dropoff_time: '',
      is_pickup_only: false,
      is_dropoff_only: false
    };
    setStations([...stations, newStation]);
  };

  const removeStation = (stationId: string) => {
    setStations(stations.filter(station => station.id !== stationId));
    // Reorder remaining stations
    setStations(prev => prev.map((station, index) => ({
      ...station,
      station_order: index + 1
    })));
  };

  const updateStation = (stationId: string, field: keyof Station, value: any) => {
    setStations(stations.map(station => 
      station.id === stationId ? { ...station, [field]: value } : station
    ));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (!formData.title || !formData.from_location || !formData.to_location || !formData.departure_time || !formData.contact_number) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Validate stations
    const invalidStations = stations.filter(station => !station.station_name);
    if (invalidStations.length > 0) {
      toast.error('يرجى ملء اسم جميع المحطات');
      return;
    }

    setLoading(true);
    try {
      // Create trip
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .insert({
          driver_id: user.id,
          title: formData.title,
          description: formData.description || null,
          from_location: formData.from_location,
          to_location: formData.to_location,
          departure_time: formData.departure_time,
          arrival_time: formData.arrival_time || null,
          price: formData.price ? parseFloat(formData.price) : null,
          max_passengers: parseInt(formData.max_passengers),
          trip_type: formData.trip_type,
          vehicle_type: formData.vehicle_type,
          contact_number: formData.contact_number
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // Create stations
      if (stations.length > 0) {
        const stationsData = stations.map(station => ({
          trip_id: tripData.id,
          station_name: station.station_name,
          station_order: station.station_order,
          pickup_time: station.pickup_time || null,
          dropoff_time: station.dropoff_time || null,
          is_pickup_only: station.is_pickup_only,
          is_dropoff_only: station.is_dropoff_only
        }));

        const { error: stationsError } = await supabase
          .from('trip_stations')
          .insert(stationsData);

        if (stationsError) throw stationsError;
      }

      toast.success('تم إنشاء الرحلة بنجاح');
      navigate('/trip-service');
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('حدث خطأ أثناء إنشاء الرحلة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إضافة رحلة جديدة</h1>
            <p className="text-muted-foreground">أضف رحلة مشتركة جديدة مع المحطات</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Trip Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  معلومات الرحلة الأساسية
                </CardTitle>
                <CardDescription>
                  املأ البيانات الأساسية للرحلة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الرحلة *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="مثال: رحلة من حدائق أكتوبر إلى وسط البلد"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trip_type">نوع الرحلة</Label>
                    <Select value={formData.trip_type} onValueChange={(value) => handleSelectChange('trip_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">عادية</SelectItem>
                        <SelectItem value="school">مدرسية</SelectItem>
                        <SelectItem value="work">عمل</SelectItem>
                        <SelectItem value="event">فعالية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف الرحلة (اختياري)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="وصف إضافي للرحلة..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from_location">من (مكان الانطلاق) *</Label>
                    <Input
                      id="from_location"
                      name="from_location"
                      value={formData.from_location}
                      onChange={handleInputChange}
                      placeholder="مثال: حدائق أكتوبر"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to_location">إلى (الوجهة النهائية) *</Label>
                    <Input
                      id="to_location"
                      name="to_location"
                      value={formData.to_location}
                      onChange={handleInputChange}
                      placeholder="مثال: وسط البلد"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure_time">وقت الانطلاق *</Label>
                    <Input
                      id="departure_time"
                      name="departure_time"
                      type="datetime-local"
                      value={formData.departure_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrival_time">وقت الوصول المتوقع (اختياري)</Label>
                    <Input
                      id="arrival_time"
                      name="arrival_time"
                      type="datetime-local"
                      value={formData.arrival_time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر (جنيه مصري) - اختياري</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="25.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_passengers">عدد الركاب الأقصى</Label>
                    <Input
                      id="max_passengers"
                      name="max_passengers"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.max_passengers}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">نوع المركبة</Label>
                    <Select value={formData.vehicle_type} onValueChange={(value) => handleSelectChange('vehicle_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">سيارة</SelectItem>
                        <SelectItem value="van">فان</SelectItem>
                        <SelectItem value="bus">حافلة</SelectItem>
                        <SelectItem value="motorcycle">دراجة نارية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">رقم التواصل *</Label>
                  <Input
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    placeholder="05xxxxxxxx"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      محطات الرحلة
                    </CardTitle>
                    <CardDescription>
                      أضف المحطات التي ستمر بها الرحلة
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={addStation}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة محطة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4" />
                    <p>لم يتم إضافة أي محطات بعد</p>
                    <p className="text-sm">انقر على "إضافة محطة" لإضافة المحطات</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stations.map((station, index) => {
                      const VehicleIcon = getVehicleIcon(formData.vehicle_type);
                      return (
                        <Card key={station.id} className="border-dashed">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <VehicleIcon className="h-4 w-4 text-primary" />
                                <span className="font-medium">المحطة {station.station_order}</span>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeStation(station.id)}
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                حذف
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>اسم المحطة *</Label>
                                <Input
                                  value={station.station_name}
                                  onChange={(e) => updateStation(station.id, 'station_name', e.target.value)}
                                  placeholder="مثال: محطة النخيل"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>وقت الاستلام</Label>
                                <Input
                                  type="time"
                                  value={station.pickup_time}
                                  onChange={(e) => updateStation(station.id, 'pickup_time', e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label>وقت النزول</Label>
                                <Input
                                  type="time"
                                  value={station.dropoff_time}
                                  onChange={(e) => updateStation(station.id, 'dropoff_time', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>نوع المحطة</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={station.is_pickup_only ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updateStation(station.id, 'is_pickup_only', !station.is_pickup_only)}
                                  >
                                    استلام فقط
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={station.is_dropoff_only ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updateStation(station.id, 'is_dropoff_only', !station.is_dropoff_only)}
                                  >
                                    نزول فقط
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Buttons */}
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
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء الرحلة'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
