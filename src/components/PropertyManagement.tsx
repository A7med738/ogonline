import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Home, 
  Building, 
  Store, 
  Briefcase, 
  Crown,
  Landmark,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Square,
  Bed,
  Bath,
  Star,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  transaction_type: string;
  price: number;
  currency: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  year_built: number;
  location: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  features: string[];
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'rented';
  admin_notes: string;
  approved_at: string;
  approved_by: string;
  created_at: string;
  updated_at: string;
  views_count: number;
  likes_count: number;
  owner_id: string;
  owner_name?: string;
}

const PropertyManagement = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const propertyTypeIcons = {
    apartment: Home,
    villa: Crown,
    land: Landmark,
    commercial: Store,
    office: Briefcase,
    warehouse: Building
  };

  const statusConfig = {
    pending: { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'معتمد', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircle },
    sold: { label: 'مباع', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    rented: { label: 'مؤجر', color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch owner names for each property
      const propertiesWithOwners = await Promise.all(
        (data || []).map(async (property) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', property.owner_id)
            .single();

          return {
            ...property,
            owner_name: profile?.full_name || 'غير محدد'
          };
        })
      );

      setProperties(propertiesWithOwners);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل العقارات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: string, notes: string = '') => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          status: newStatus,
          admin_notes: notes,
          approved_at: newStatus === 'approved' ? new Date().toISOString() : null,
          approved_by: newStatus === 'approved' ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => 
        prev.map(prop => 
          prop.id === propertyId 
            ? { ...prop, status: newStatus as any, admin_notes: notes }
            : prop
        )
      );

      toast({
        title: "تم تحديث حالة العقار",
        description: `تم ${newStatus === 'approved' ? 'اعتماد' : 'رفض'} العقار بنجاح`
      });

      setSelectedProperty(null);
      setAdminNotes('');
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث العقار",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.owner_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderPropertyCard = (property: Property) => {
    const PropertyIcon = propertyTypeIcons[property.property_type as keyof typeof propertyTypeIcons] || Home;
    const statusInfo = statusConfig[property.status];

    return (
      <motion.div
        key={property.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="cursor-pointer"
        onClick={() => setSelectedProperty(property)}
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <PropertyIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{property.title}</h3>
                  <p className="text-xs text-gray-600">{property.location}</p>
                </div>
              </div>
              <Badge className={cn("text-xs", statusInfo.color)}>
                <statusInfo.icon className="w-3 h-3 ml-1" />
                {statusInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <DollarSign className="w-3 h-3" />
                <span>{property.price.toLocaleString()} {property.currency}</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Square className="w-3 h-3" />
                <span>{property.area} م²</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Bed className="w-3 h-3" />
                <span>{property.bedrooms} غرف</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Bath className="w-3 h-3" />
                <span>{property.bathrooms} حمام</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Calendar className="w-3 h-3" />
                <span>{new Date(property.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Eye className="w-3 h-3" />
                <span>{property.views_count}</span>
              </div>
            </div>

            {/* Action Buttons - Only show for pending properties */}
            {property.status === 'pending' && (
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(property.id, 'approved');
                  }}
                >
                  <Check className="w-3 h-3 ml-1" />
                  قبول
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(property.id, 'rejected');
                  }}
                >
                  <X className="w-3 h-3 ml-1" />
                  رفض
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderPropertyDetails = () => {
    if (!selectedProperty) return null;

    const PropertyIcon = propertyTypeIcons[selectedProperty.property_type as keyof typeof propertyTypeIcons] || Home;
    const statusInfo = statusConfig[selectedProperty.status];

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedProperty(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <PropertyIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{selectedProperty.title}</h1>
                  <p className="text-emerald-100">{selectedProperty.location}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedProperty(null)}
                className="text-white hover:bg-white/20"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">تفاصيل العقار</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">النوع:</span>
                      <span className="font-medium">{selectedProperty.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المعاملة:</span>
                      <span className="font-medium">{selectedProperty.transaction_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">السعر:</span>
                      <span className="font-medium">{selectedProperty.price.toLocaleString()} {selectedProperty.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المساحة:</span>
                      <span className="font-medium">{selectedProperty.area} م²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الغرف:</span>
                      <span className="font-medium">{selectedProperty.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحمامات:</span>
                      <span className="font-medium">{selectedProperty.bathrooms}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">معلومات المالك</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{selectedProperty.contact_phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedProperty.contact_email || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{selectedProperty.owner_name || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">إجراءات الإدارة</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">ملاحظات الإدارة</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                        placeholder="أضف ملاحظاتك هنا..."
                      />
                    </div>
                    
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        onClick={() => handleStatusChange(selectedProperty.id, 'approved', adminNotes)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 ml-2" />
                        اعتماد
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(selectedProperty.id, 'rejected', adminNotes)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 ml-2" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">إحصائيات</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المشاهدات:</span>
                      <span className="font-medium">{selectedProperty.views_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الإعجابات:</span>
                      <span className="font-medium">{selectedProperty.likes_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الإضافة:</span>
                      <span className="font-medium">{new Date(selectedProperty.created_at).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة العقارات</h1>
          <p className="text-gray-600">مراجعة واعتماد العقارات المضافة</p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            {filteredProperties.length} عقار
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="البحث في العقارات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="فلترة حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">في الانتظار</SelectItem>
            <SelectItem value="approved">معتمد</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredProperties.map(renderPropertyCard)}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <Home className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            لا توجد عقارات
          </h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'لا توجد عقارات تطابق معايير البحث'
              : 'لم يتم إضافة أي عقارات بعد'
            }
          </p>
        </div>
      )}

      {/* Property Details Modal */}
      <AnimatePresence>
        {selectedProperty && renderPropertyDetails()}
      </AnimatePresence>
    </div>
  );
};

export default PropertyManagement;
