import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, MapPin } from "lucide-react";

interface PoliceStation {
  id: string;
  name: string;
  area: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  show_location: boolean;
}

interface EmergencyContact {
  id: string;
  station_id: string;
  title: string;
  number: string;
  description: string;
  type: string;
  available: boolean;
  order_priority: number;
}

export const PoliceStationsManagement = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showContacts, setShowContacts] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    address: '',
    description: '',
    latitude: '',
    longitude: '',
    show_location: true
  });

  const [contactData, setContactData] = useState({
    title: '',
    number: '',
    description: '',
    type: 'emergency',
    available: true,
    order_priority: 0
  });

  useEffect(() => {
    loadStations();
    loadContacts();
  }, []);

  const loadStations = async () => {
    try {
      const { data, error } = await supabase
        .from('police_stations')
        .select('*')
        .order('name');

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error loading police stations:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل مراكز الشرطة",
        variant: "destructive"
      });
    }
  };

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('order_priority');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const stationData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      if (editingId) {
        const { error } = await supabase
          .from('police_stations')
          .update(stationData)
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('police_stations')
          .insert(stationData);

        if (error) throw error;
        setIsAdding(false);
      }

      setFormData({
        name: '',
        area: '',
        address: '',
        description: '',
        latitude: '',
        longitude: '',
        show_location: true
      });
      loadStations();
      
      toast({
        title: "تم بنجاح",
        description: editingId ? "تم تحديث المركز" : "تم إضافة المركز",
      });
    } catch (error) {
      console.error('Error saving station:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المركز",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (station: PoliceStation) => {
    setFormData({
      name: station.name,
      area: station.area,
      address: station.address || '',
      description: station.description || '',
      latitude: station.latitude?.toString() || '',
      longitude: station.longitude?.toString() || '',
      show_location: station.show_location
    });
    setEditingId(station.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('police_stations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      loadStations();
      toast({
        title: "تم بنجاح",
        description: "تم حذف المركز",
      });
    } catch (error) {
      console.error('Error deleting station:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المركز",
        variant: "destructive"
      });
    }
  };

  const handleAddContact = async (stationId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          ...contactData,
          station_id: stationId
        });

      if (error) throw error;
      
      setContactData({
        title: '',
        number: '',
        description: '',
        type: 'emergency',
        available: true,
        order_priority: 0
      });
      loadContacts();
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة رقم الطوارئ",
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة رقم الطوارئ",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      area: '',
      address: '',
      description: '',
      latitude: '',
      longitude: '',
      show_location: true
    });
  };

  const getStationContacts = (stationId: string) => {
    return contacts.filter(contact => contact.station_id === stationId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">إدارة مراكز الشرطة</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة مركز جديد
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المركز</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مركز شرطة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">المنطقة</label>
              <Input
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="المنطقة"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">العنوان</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="العنوان بالتفصيل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">خط العرض</label>
              <Input
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="24.7136"
                type="number"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">خط الطول</label>
              <Input
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="46.6753"
                type="number"
                step="any"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">الوصف</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف المركز وخدماته"
                rows={3}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <Switch
                checked={formData.show_location}
                onCheckedChange={(checked) => setFormData({ ...formData, show_location: checked })}
              />
              <label className="text-sm">إظهار الموقع على الخريطة</label>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {editingId ? 'تحديث' : 'حفظ'}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                إلغاء
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {stations.map((station) => (
          <Card key={station.id} className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-lg">{station.name}</h4>
                <p className="text-sm text-muted-foreground font-medium">{station.area}</p>
                {station.address && (
                  <p className="text-sm text-muted-foreground flex items-start gap-1 mt-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{station.address}</span>
                  </p>
                )}
                {station.description && (
                  <p className="text-sm mt-2 p-2 bg-muted rounded">{station.description}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContacts(showContacts === station.id ? null : station.id)}
                  className="w-full sm:w-auto"
                >
                  أرقام الطوارئ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(station)}
                  className="flex items-center justify-center gap-1 w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">تعديل</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(station.id)}
                  className="flex items-center justify-center gap-1 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">حذف</span>
                </Button>
              </div>
            </div>

            {showContacts === station.id && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input
                    placeholder="اسم الخدمة"
                    value={contactData.title}
                    onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                  />
                  <Input
                    placeholder="رقم الهاتف"
                    value={contactData.number}
                    onChange={(e) => setContactData({ ...contactData, number: e.target.value })}
                  />
                  <Input
                    placeholder="الوصف"
                    value={contactData.description}
                    onChange={(e) => setContactData({ ...contactData, description: e.target.value })}
                  />
                  <Button onClick={() => handleAddContact(station.id)} size="sm">
                    إضافة رقم
                  </Button>
                </div>

                <div className="space-y-2">
                  {getStationContacts(station.id).map((contact) => (
                    <div key={contact.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{contact.title}</span>
                        <span className="mx-2">-</span>
                        <span className="text-primary">{contact.number}</span>
                        {contact.description && (
                          <span className="text-sm text-muted-foreground block">{contact.description}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};