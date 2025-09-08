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

const categories = [
  "حيوان أليف",
  "مفاتيح",
  "محفظة",
  "وثائق رسمية",
  "هاتف",
  "أخرى",
];

const ReportFound: React.FC = () => {
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [description, setDescription] = useState("");
  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [media, setMedia] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return toast.error("يرجى اختيار ما وجدته");
    if (!location) return toast.error("يرجى تحديد الموقع");
    if (!contactMethod.trim()) return toast.error("يرجى إضافة طريقة تواصل");

    // TODO: Save to Supabase table (lost_and_found)
    toast.success("تم إرسال بلاغ الوجود بنجاح");
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
              <Label>ماذا وجدت؟</Label>
              <Select value={category} onValueChange={setCategory}>
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
              <Label>أين وجدته؟</Label>
              <LocationPicker
                onLocationSelect={(lat, lng, address) => setLocation({ lat, lng, address })}
                placeholder="ابحث أو استخدم موقعك الحالي"
              />
            </div>

            <div className="space-y-2">
              <Label>وصف وصورة للشيء</Label>
              <Textarea
                placeholder="مثال: ميدالية مفاتيح عليها شعار سيارة"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <NewsMediaUpload onMediaChange={setMedia} />
            </div>

            <div className="space-y-2">
              <Label>مكان التسليم</Label>
              <Input
                placeholder="اكتب وصف مكان التسليم أو 'التواصل معي لتنسيق التسليم'"
                value={deliveryPlace}
                onChange={(e) => setDeliveryPlace(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>طريقة التواصل</Label>
              <Input
                placeholder="رقم هاتف أو اختر التواصل عبر رسائل التطبيق"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
              />
            </div>
          </GlassCard>

          <div className="flex justify-end">
            <Button type="submit" className="min-w-36">إرسال البلاغ</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFound;


