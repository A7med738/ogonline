import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glass-card";
import { LocationPicker } from "@/components/LocationPicker";
import { NewsMediaUpload } from "@/components/NewsMediaUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  "حيوان أليف",
  "مفاتيح",
  "محفظة",
  "وثائق رسمية",
  "هاتف",
  "أخرى",
];

const ReportFound: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [description, setDescription] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    
    if (!title.trim()) return toast.error("يرجى إدخال عنوان للموجود");
    if (!category) return toast.error("يرجى اختيار ما وجدته");
    if (!location) return toast.error("يرجى تحديد الموقع");
    if (!contactMethod) return toast.error("يرجى اختيار طريقة التواصل");
    if (!contactDetails.trim()) return toast.error("يرجى إدخال تفاصيل التواصل");

    setLoading(true);

    try {
      // رفع الصورة إذا كانت موجودة
      let imageUrl = null;
      if (media.length > 0 && media[0].file) {
        const file = media[0].file;
        const fileName = `found-items/${Date.now()}-${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('news-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // إدراج البلاغ في قاعدة البيانات مع حالة "pending" للمراجعة
      const { error } = await supabase
        .from('lost_and_found_items')
        .insert({
          user_id: user.id,
          type: 'found',
          title: title.trim(),
          description: description.trim(),
          category,
          location_description: location.address || `${location.lat}, ${location.lng}`,
          latitude: location.lat,
          longitude: location.lng,
          contact_method: contactMethod,
          contact_details: contactDetails.trim(),
          image_url: imageUrl,
          status: 'pending' // سيحتاج موافقة من المدير
        });

      if (error) throw error;

      toast.success("تم إرسال البلاغ بنجاح! سيتم مراجعته من قبل الإدارة قبل نشره.");
      
      // إعادة تعيين النموذج
      setTitle("");
      setCategory("");
      setLocation(null);
      setDescription("");
      setContactMethod("");
      setContactDetails("");
      setMedia([]);
    } catch (error: any) {
      toast.error("حدث خطأ في إرسال البلاغ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold">إبلاغ عن شيء موجود</h3>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
          <GlassCard className="p-4 space-y-3">
            <div className="space-y-2">
              <Label>عنوان الشيء الموجود *</Label>
              <Input
                placeholder="مثال: حيوان أليف، محفظة جلدية"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>نوع الشيء الموجود *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>أين وجدته؟ *</Label>
              <LocationPicker
                onLocationSelect={(lat, lng, address) => setLocation({ lat, lng, address })}
                placeholder="ابحث أو استخدم موقعك الحالي"
              />
            </div>

            <div className="space-y-2">
              <Label>وصف تفصيلي وصورة للشيء</Label>
              <Textarea
                placeholder="مثال: محفظة جلدية سوداء تحتوي على بطاقات شخصية، ميدالية مفاتيح عليها شعار سيارة"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <NewsMediaUpload onMediaChange={setMedia} />
            </div>

            <div className="space-y-2">
              <Label>طريقة التواصل المفضلة *</Label>
              <Select value={contactMethod} onValueChange={setContactMethod} required>
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة التواصل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">رقم الهاتف</SelectItem>
                  <SelectItem value="email">البريد الإلكتروني</SelectItem>
                  <SelectItem value="both">الهاتف والبريد الإلكتروني</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تفاصيل التواصل *</Label>
              <Input
                placeholder={
                  contactMethod === "email" 
                    ? "أدخل بريدك الإلكتروني"
                    : contactMethod === "phone"
                    ? "أدخل رقم هاتفك"
                    : "أدخل رقم الهاتف والبريد الإلكتروني"
                }
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                required
              />
            </div>
          </GlassCard>

          <div className="flex justify-end">
            <Button type="submit" className="min-w-36" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال البلاغ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFound;


