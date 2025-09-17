-- إنشاء جدول الفنادق
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,
  image_url TEXT,
  logo_url TEXT,
  star_rating INTEGER DEFAULT 3 CHECK (star_rating >= 1 AND star_rating <= 5),
  price_range TEXT DEFAULT 'mid-range' CHECK (price_range IN ('budget', 'mid-range', 'luxury')),
  check_in_time TIME DEFAULT '14:00',
  check_out_time TIME DEFAULT '12:00',
  amenities TEXT[],
  room_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس للفنادق
CREATE INDEX IF NOT EXISTS idx_hotels_active ON public.hotels(is_active);
CREATE INDEX IF NOT EXISTS idx_hotels_star_rating ON public.hotels(star_rating);
CREATE INDEX IF NOT EXISTS idx_hotels_price_range ON public.hotels(price_range);

-- تمكين RLS للفنادق
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إذا كانت موجودة
DROP POLICY IF EXISTS "Anyone can view active hotels" ON public.hotels;
DROP POLICY IF EXISTS "Admins can manage all hotels" ON public.hotels;

-- إنشاء سياسات RLS للفنادق
CREATE POLICY "Anyone can view active hotels" ON public.hotels 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all hotels" ON public.hotels 
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- إدراج بيانات تجريبية للفنادق
INSERT INTO public.hotels (name, description, phone, address, email, star_rating, price_range, check_in_time, check_out_time, amenities, room_types) VALUES
('فندق النهضة', 'فندق فاخر في قلب المدينة مع جميع المرافق الحديثة', '01234567890', 'شارع النهضة، حدائق أكتوبر', 'info@nahda-hotel.com', 5, 'luxury', '15:00', '12:00', ARRAY['wifi', 'parking', 'restaurant', 'gym', 'pool', 'spa', 'room_service'], ARRAY['غرفة فردية', 'غرفة مزدوجة', 'جناح', 'شقة']),
('فندق الشفاء', 'فندق متوسط مع خدمات ممتازة', '01234567891', 'شارع الشفاء، حدائق أكتوبر', 'info@shifa-hotel.com', 4, 'mid-range', '14:00', '11:00', ARRAY['wifi', 'parking', 'restaurant', 'gym'], ARRAY['غرفة فردية', 'غرفة مزدوجة', 'غرفة عائلية']),
('فندق الحياة', 'فندق اقتصادي مع خدمات أساسية', '01234567892', 'شارع الحياة، حدائق أكتوبر', 'info@haya-hotel.com', 3, 'budget', '14:00', '12:00', ARRAY['wifi', 'parking'], ARRAY['غرفة فردية', 'غرفة مزدوجة'])
ON CONFLICT (name) DO NOTHING;
