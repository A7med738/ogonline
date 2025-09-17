import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Hospital, Stethoscope, Heart, Building2, Plus, Edit, Trash2, Star, MapPin, Phone, Mail, Globe, Clock, Users, DollarSign, Ambulance, Car, Pill, Microscope, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ImageUploadField from '@/components/ImageUploadField';

interface Hospital {
  id: string;
  name: string;
  type: string;
  level: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  bed_capacity?: number;
  emergency_services: boolean;
  icu_available: boolean;
  surgery_available: boolean;
  pediatrics_available: boolean;
  maternity_available: boolean;
  cardiology_available: boolean;
  neurology_available: boolean;
  oncology_available: boolean;
  specialties?: string[];
  insurance_accepted?: string[];
  operating_hours?: string;
  emergency_phone?: string;
  ambulance_available: boolean;
  parking_available: boolean;
  pharmacy_available: boolean;
  lab_services: boolean;
  radiology_services: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Clinic {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  doctor_name?: string;
  doctor_qualification?: string;
  doctor_specialization?: string;
  consultation_fee?: number;
  established_year?: number;
  operating_hours?: string;
  appointment_required: boolean;
  walk_in_accepted: boolean;
  insurance_accepted?: string[];
  services?: string[];
  equipment?: string[];
  languages?: string[];
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface HealthUnit {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  capacity?: number;
  operating_hours?: string;
  services?: string[];
  target_groups?: string[];
  vaccination_available: boolean;
  family_planning: boolean;
  prenatal_care: boolean;
  child_health: boolean;
  chronic_disease_management: boolean;
  health_education: boolean;
  free_services: boolean;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MedicalCenter {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  logo_url?: string;
  established_year?: number;
  capacity?: number;
  operating_hours?: string;
  services?: string[];
  equipment?: string[];
  specialties?: string[];
  appointment_required: boolean;
  walk_in_accepted: boolean;
  insurance_accepted?: string[];
  languages?: string[];
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MedicalServicesManagement = () => {
  const [activeTab, setActiveTab] = useState('hospitals');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [healthUnits, setHealthUnits] = useState<HealthUnit[]>([]);
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'hospitals':
          const { data: hospitalsData } = await supabase
            .from('hospitals')
            .select('*')
            .order('created_at', { ascending: false });
          setHospitals(hospitalsData || []);
          break;
        case 'clinics':
          const { data: clinicsData } = await supabase
            .from('clinics')
            .select('*')
            .order('created_at', { ascending: false });
          setClinics(clinicsData || []);
          break;
        case 'health-units':
          const { data: healthUnitsData } = await supabase
            .from('health_units')
            .select('*')
            .order('created_at', { ascending: false });
          setHealthUnits(healthUnitsData || []);
          break;
        case 'medical-centers':
          const { data: medicalCentersData } = await supabase
            .from('medical_centers')
            .select('*')
            .order('created_at', { ascending: false });
          setMedicalCenters(medicalCentersData || []);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف العنصر بنجاح',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف العنصر',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      const table = getTableName();
      const data = { ...formData };

      if (editingItem) {
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث العنصر بنجاح',
        });
      } else {
        const { error } = await supabase
          .from(table)
          .insert([data]);
        if (error) throw error;
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة العنصر بنجاح',
        });
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ العنصر',
        variant: 'destructive',
      });
    }
  };

  const getTableName = () => {
    switch (activeTab) {
      case 'hospitals': return 'hospitals';
      case 'clinics': return 'clinics';
      case 'health-units': return 'health_units';
      case 'medical-centers': return 'medical_centers';
      default: return 'hospitals';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const renderHospitals = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hospitals.map((hospital) => (
        <Card key={hospital.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Hospital className="h-6 w-6 text-red-600" />
                <div>
                  <CardTitle className="text-lg">{hospital.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="secondary" className="mr-2">{hospital.type}</Badge>
                    <Badge variant="outline">{hospital.level}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(hospital.rating)}
                <span className="text-sm text-gray-500">({hospital.rating})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hospital.address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{hospital.address}</span>
                </div>
              )}
              {hospital.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{hospital.phone}</span>
                </div>
              )}
              {hospital.bed_capacity && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>السعة: {hospital.bed_capacity} سرير</span>
                </div>
              )}
              {hospital.google_maps_url && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <a 
                    href={hospital.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض الموقع على خرائط جوجل
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Switch checked={hospital.is_active} disabled />
                <span className={hospital.is_active ? 'text-green-600' : 'text-red-600'}>
                  {hospital.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleEdit(hospital)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(hospital.id, 'hospitals')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderClinics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clinics.map((clinic) => (
        <Card key={clinic.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">{clinic.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="secondary" className="mr-2">{clinic.type}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(clinic.rating)}
                <span className="text-sm text-gray-500">({clinic.rating})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clinic.address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{clinic.address}</span>
                </div>
              )}
              {clinic.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{clinic.phone}</span>
                </div>
              )}
              {clinic.consultation_fee && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{clinic.consultation_fee} جنيه</span>
                </div>
              )}
              {clinic.google_maps_url && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <a 
                    href={clinic.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض الموقع على خرائط جوجل
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Switch checked={clinic.is_active} disabled />
                <span className={clinic.is_active ? 'text-green-600' : 'text-red-600'}>
                  {clinic.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleEdit(clinic)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(clinic.id, 'clinics')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderHealthUnits = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {healthUnits.map((unit) => (
        <Card key={unit.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle className="text-lg">{unit.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="secondary" className="mr-2">{unit.type}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(unit.rating)}
                <span className="text-sm text-gray-500">({unit.rating})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unit.address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{unit.address}</span>
                </div>
              )}
              {unit.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{unit.phone}</span>
                </div>
              )}
              {unit.capacity && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>السعة: {unit.capacity}</span>
                </div>
              )}
              {unit.google_maps_url && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <a 
                    href={unit.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض الموقع على خرائط جوجل
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Switch checked={unit.is_active} disabled />
                <span className={unit.is_active ? 'text-green-600' : 'text-red-600'}>
                  {unit.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleEdit(unit)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(unit.id, 'health_units')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMedicalCenters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {medicalCenters.map((center) => (
        <Card key={center.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle className="text-lg">{center.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="secondary" className="mr-2">{center.type}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(center.rating)}
                <span className="text-sm text-gray-500">({center.rating})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {center.address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{center.address}</span>
                </div>
              )}
              {center.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{center.phone}</span>
                </div>
              )}
              {center.capacity && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>السعة: {center.capacity}</span>
                </div>
              )}
              {center.google_maps_url && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <a 
                    href={center.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض الموقع على خرائط جوجل
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Switch checked={center.is_active} disabled />
                <span className={center.is_active ? 'text-green-600' : 'text-red-600'}>
                  {center.is_active ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleEdit(center)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(center.id, 'medical_centers')}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderForm = () => {
    const commonFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل الاسم"
            />
          </div>
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="أدخل رقم الهاتف"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>
          <div>
            <Label htmlFor="website">الموقع الإلكتروني</Label>
            <Input
              id="website"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="أدخل الموقع الإلكتروني"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="address">العنوان</Label>
          <Input
            id="address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="أدخل العنوان"
          />
        </div>
        <div>
          <Label htmlFor="description">الوصف</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="أدخل الوصف"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUploadField
            label="صورة الخدمة"
            value={formData.image_url || ''}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            placeholder="أدخل رابط الصورة"
          />
          <ImageUploadField
            label="شعار الخدمة"
            value={formData.logo_url || ''}
            onChange={(url) => setFormData({ ...formData, logo_url: url })}
            placeholder="أدخل رابط الشعار"
          />
        </div>
        <div>
          <Label htmlFor="google_maps_url">رابط خرائط جوجل</Label>
          <Input
            id="google_maps_url"
            value={formData.google_maps_url || ''}
            onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
            placeholder="أدخل رابط خرائط جوجل"
          />
        </div>
      </>
    );

    switch (activeTab) {
      case 'hospitals':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">نوع المستشفى *</Label>
                <Select value={formData.type || ''} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المستشفى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">حكومي</SelectItem>
                    <SelectItem value="private">خاص</SelectItem>
                    <SelectItem value="specialized">متخصص</SelectItem>
                    <SelectItem value="university">جامعي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">المستوى</Label>
                <Select value={formData.level || ''} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">أولي</SelectItem>
                    <SelectItem value="secondary">ثانوي</SelectItem>
                    <SelectItem value="tertiary">ثالثي</SelectItem>
                    <SelectItem value="quaternary">رابعي</SelectItem>
                    <SelectItem value="غير محدد">غير محدد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bed_capacity">سعة الأسرة</Label>
                <Input
                  id="bed_capacity"
                  type="number"
                  value={formData.bed_capacity || ''}
                  onChange={(e) => setFormData({ ...formData, bed_capacity: parseInt(e.target.value) || 0 })}
                  placeholder="عدد الأسرة"
                />
              </div>
              <div>
                <Label htmlFor="established_year">سنة التأسيس</Label>
                <Input
                  id="established_year"
                  type="number"
                  value={formData.established_year || ''}
                  onChange={(e) => setFormData({ ...formData, established_year: parseInt(e.target.value) || 0 })}
                  placeholder="سنة التأسيس"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.emergency_services || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, emergency_services: checked })}
                />
                <Label>خدمات الطوارئ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.icu_available || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, icu_available: checked })}
                />
                <Label>العناية المركزة</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.surgery_available || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, surgery_available: checked })}
                />
                <Label>الجراحة</Label>
              </div>
            </div>
          </>
        );

      case 'clinics':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">نوع العيادة *</Label>
                <Select value={formData.type || ''} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع العيادة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">عامة</SelectItem>
                    <SelectItem value="specialized">متخصصة</SelectItem>
                    <SelectItem value="dental">أسنان</SelectItem>
                    <SelectItem value="dermatology">جلدية</SelectItem>
                    <SelectItem value="ophthalmology">عيون</SelectItem>
                    <SelectItem value="cardiology">قلب</SelectItem>
                    <SelectItem value="neurology">أعصاب</SelectItem>
                    <SelectItem value="orthopedics">عظام</SelectItem>
                    <SelectItem value="pediatrics">أطفال</SelectItem>
                    <SelectItem value="gynecology">نساء</SelectItem>
                    <SelectItem value="psychiatry">نفسية</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="consultation_fee">رسوم الاستشارة</Label>
                <Input
                  id="consultation_fee"
                  type="number"
                  value={formData.consultation_fee || ''}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
                  placeholder="الرسوم بالجنيه المصري"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor_name">اسم الطبيب</Label>
                <Input
                  id="doctor_name"
                  value={formData.doctor_name || ''}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  placeholder="اسم الطبيب"
                />
              </div>
              <div>
                <Label htmlFor="doctor_specialization">تخصص الطبيب</Label>
                <Input
                  id="doctor_specialization"
                  value={formData.doctor_specialization || ''}
                  onChange={(e) => setFormData({ ...formData, doctor_specialization: e.target.value })}
                  placeholder="تخصص الطبيب"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.appointment_required || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, appointment_required: checked })}
                />
                <Label>يحتاج موعد</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.walk_in_accepted || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, walk_in_accepted: checked })}
                />
                <Label>يقبل المراجعين المباشرين</Label>
              </div>
            </div>
          </>
        );

      case 'health-units':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">نوع الوحدة الصحية *</Label>
                <Select value={formData.type || ''} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الوحدة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary_health_center">مركز صحي أولي</SelectItem>
                    <SelectItem value="family_medicine">طب الأسرة</SelectItem>
                    <SelectItem value="community_health">صحة المجتمع</SelectItem>
                    <SelectItem value="preventive_medicine">الطب الوقائي</SelectItem>
                    <SelectItem value="maternal_child_health">صحة الأم والطفل</SelectItem>
                    <SelectItem value="school_health">الصحة المدرسية</SelectItem>
                    <SelectItem value="occupational_health">الصحة المهنية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">السعة</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="عدد المرضى يومياً"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.vaccination_available || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, vaccination_available: checked })}
                />
                <Label>التطعيم</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.family_planning || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, family_planning: checked })}
                />
                <Label>تنظيم الأسرة</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.free_services || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, free_services: checked })}
                />
                <Label>خدمات مجانية</Label>
              </div>
            </div>
          </>
        );

      case 'medical-centers':
        return (
          <>
            {commonFields}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">نوع المركز الطبي *</Label>
                <Select value={formData.type || ''} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المركز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnostic_center">مركز تشخيصي</SelectItem>
                    <SelectItem value="imaging_center">مركز تصوير</SelectItem>
                    <SelectItem value="laboratory">مختبر</SelectItem>
                    <SelectItem value="rehabilitation_center">مركز تأهيل</SelectItem>
                    <SelectItem value="dialysis_center">مركز غسيل كلى</SelectItem>
                    <SelectItem value="cancer_center">مركز سرطان</SelectItem>
                    <SelectItem value="cardiac_center">مركز قلب</SelectItem>
                    <SelectItem value="eye_center">مركز عيون</SelectItem>
                    <SelectItem value="dental_center">مركز أسنان</SelectItem>
                    <SelectItem value="mental_health_center">مركز صحة نفسية</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">السعة</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="السعة"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.appointment_required || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, appointment_required: checked })}
                />
                <Label>يحتاج موعد</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.walk_in_accepted || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, walk_in_accepted: checked })}
                />
                <Label>يقبل المراجعين المباشرين</Label>
              </div>
            </div>
          </>
        );

      default:
        return commonFields;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الخدمات الطبية</h1>
          <p className="text-gray-600 mt-2">إدارة المستشفيات، العيادات، الوحدات الصحية، والمراكز الطبية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              إضافة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'تعديل' : 'إضافة'} {activeTab === 'hospitals' ? 'مستشفى' : activeTab === 'clinics' ? 'عيادة' : activeTab === 'health-units' ? 'وحدة صحية' : 'مركز طبي'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'قم بتعديل البيانات أدناه' : 'أدخل البيانات المطلوبة أدناه'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {renderForm()}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
                {editingItem ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hospitals" className="flex items-center space-x-2">
            <Hospital className="h-4 w-4" />
            <span>المستشفيات</span>
          </TabsTrigger>
          <TabsTrigger value="clinics" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>العيادات</span>
          </TabsTrigger>
          <TabsTrigger value="health-units" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>الوحدات الصحية</span>
          </TabsTrigger>
          <TabsTrigger value="medical-centers" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>المراكز الطبية</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hospitals" className="mt-6">
          {hospitals.length === 0 ? (
            <div className="text-center py-12">
              <Hospital className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مستشفيات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة مستشفى جديد</p>
              <Button onClick={handleAddNew} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة مستشفى
              </Button>
            </div>
          ) : (
            renderHospitals()
          )}
        </TabsContent>

        <TabsContent value="clinics" className="mt-6">
          {clinics.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عيادات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة عيادة جديدة</p>
              <Button onClick={handleAddNew} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة عيادة
              </Button>
            </div>
          ) : (
            renderClinics()
          )}
        </TabsContent>

        <TabsContent value="health-units" className="mt-6">
          {healthUnits.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد وحدات صحية</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة وحدة صحية جديدة</p>
              <Button onClick={handleAddNew} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة وحدة صحية
              </Button>
            </div>
          ) : (
            renderHealthUnits()
          )}
        </TabsContent>

        <TabsContent value="medical-centers" className="mt-6">
          {medicalCenters.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مراكز طبية</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة مركز طبي جديد</p>
              <Button onClick={handleAddNew} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة مركز طبي
              </Button>
            </div>
          ) : (
            renderMedicalCenters()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalServicesManagement;
