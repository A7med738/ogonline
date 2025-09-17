import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Phone, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SchoolTransportOffer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    number_of_children: '',
    contact_number: '',
    price: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (!formData.from_location || !formData.to_location || !formData.number_of_children || !formData.contact_number) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('school_transport_requests')
        .insert({
          user_id: user.id,
          type: 'offer',
          from_location: formData.from_location,
          to_location: formData.to_location,
          number_of_children: parseInt(formData.number_of_children),
          contact_number: formData.contact_number,
          price: formData.price ? parseFloat(formData.price) : null,
          description: formData.description || null
        });

      if (error) throw error;

      toast.success('تم إضافة الدورة المتاحة بنجاح');
      navigate('/services/school-transport');
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('حدث خطأ أثناء إضافة الدورة');
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
            <h1 className="text-2xl font-bold text-foreground">عرض دورة متاحة</h1>
            <p className="text-muted-foreground">أضف دورة مدرسية متاحة للآخرين</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                تفاصيل الدورة
              </CardTitle>
              <CardDescription>
                املأ البيانات التالية لإضافة دورة مدرسية متاحة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from_location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      من (مكان الانطلاق)
                    </Label>
                    <Input
                      id="from_location"
                      name="from_location"
                      value={formData.from_location}
                      onChange={handleInputChange}
                      placeholder="مثال: حي النخيل"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to_location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      إلى (المدرسة)
                    </Label>
                    <Input
                      id="to_location"
                      name="to_location"
                      value={formData.to_location}
                      onChange={handleInputChange}
                      placeholder="مثال: مدرسة الأمل الابتدائية"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number_of_children" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      عدد الأطفال المطلوب
                    </Label>
                    <Input
                      id="number_of_children"
                      name="number_of_children"
                      type="number"
                      min="1"
                      value={formData.number_of_children}
                      onChange={handleInputChange}
                      placeholder="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      رقم التواصل
                    </Label>
                    <Input
                      id="contact_number"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      placeholder="05xxxxxxxx"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    السعر (جنيه مصري) - اختياري
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="100.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">تفاصيل إضافية (اختياري)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أي تفاصيل إضافية تريد إضافتها..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/services/school-transport')}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'جاري الإضافة...' : 'إضافة الدورة'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchoolTransportOffer;
