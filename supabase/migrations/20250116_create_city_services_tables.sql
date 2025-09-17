-- إنشاء جدول الخدمات الجديدة للمدينة
CREATE TABLE public.city_services_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL CHECK (service_type IN (
    'traffic', 'civil_registry', 'wholesale_market', 'city_center', 
    'family_court', 'courts', 'pharmacies', 'education_department'
  )),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,
  image_url TEXT,
  logo_url TEXT,
  operating_hours TEXT,
  services TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_city_services_new_type ON public.city_services_new(service_type);
CREATE INDEX idx_city_services_new_active ON public.city_services_new(is_active);

-- تمكين RLS
ALTER TABLE public.city_services_new ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS
CREATE POLICY "Anyone can view active city services" ON public.city_services_new 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all city services" ON public.city_services_new 
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- إنشاء جدول الصيدليات
CREATE TABLE public.pharmacies (
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
  established_year INTEGER,
  operating_hours TEXT NOT NULL,
  services TEXT[],
  languages TEXT[],
  parking_available BOOLEAN DEFAULT false,
  wheelchair_accessible BOOLEAN DEFAULT false,
  home_delivery BOOLEAN DEFAULT false,
  emergency_service BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس للصيدليات
CREATE INDEX idx_pharmacies_active ON public.pharmacies(is_active);
CREATE INDEX idx_pharmacies_rating ON public.pharmacies(rating);

-- تمكين RLS للصيدليات
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS للصيدليات
CREATE POLICY "Anyone can view active pharmacies" ON public.pharmacies 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all pharmacies" ON public.pharmacies 
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- إدراج بيانات تجريبية
INSERT INTO public.city_services_new (service_type, name, description, phone, address, operating_hours, services) VALUES
('traffic', 'إدارة المرور الرئيسية', 'الخدمات الرئيسية لإدارة المرور والتراخيص', '01234567890', 'شارع المرور، حدائق أكتوبر', 'السبت - الخميس: 8:00 - 16:00', ARRAY['تجديد رخصة القيادة', 'استخراج رخصة جديدة', 'دفع المخالفات', 'استعلام عن المخالفات']),
('civil_registry', 'مكتب السجل المدني الرئيسي', 'الخدمات الرئيسية للسجل المدني والهوية', '01234567891', 'شارع السجل المدني، حدائق أكتوبر', 'السبت - الخميس: 8:00 - 16:00', ARRAY['استخراج شهادة ميلاد', 'استخراج شهادة وفاة', 'تعديل البيانات', 'استخراج شهادة زواج']),
('wholesale_market', 'سوق الجملة الرئيسي', 'السوق الرئيسي للمواد الغذائية والاستهلاكية', '01234567892', 'شارع سوق الجملة، حدائق أكتوبر', 'السبت - الخميس: 6:00 - 18:00', ARRAY['الخضروات والفواكه', 'اللحوم والدواجن', 'الألبان ومنتجاتها', 'الحبوب والبقوليات']),
('city_center', 'السنترال الرئيسي', 'السنترال الرئيسي للمدينة', '01234567893', 'ميدان المدينة، حدائق أكتوبر', '24/7', ARRAY['خدمات الهاتف', 'خدمات الإنترنت', 'خدمات البريد', 'خدمات الطوارئ']),
('family_court', 'نيابة الأسرة', 'النيابة المتخصصة في قضايا الأسرة', '01234567894', 'شارع المحاكم، حدائق أكتوبر', 'السبت - الخميس: 8:00 - 16:00', ARRAY['قضايا الطلاق', 'قضايا النفقة', 'قضايا الحضانة', 'قضايا الميراث']),
('courts', 'مجمع المحاكم', 'المجمع الرئيسي للمحاكم في المدينة', '01234567895', 'شارع المحاكم، حدائق أكتوبر', 'السبت - الخميس: 8:00 - 16:00', ARRAY['المحكمة الابتدائية', 'محكمة الاستئناف', 'محكمة النقض', 'المحكمة الدستورية']),
('education_department', 'إدارة التعليم العام', 'الإدارة المسؤولة عن التعليم العام في المدينة', '01234567896', 'شارع التعليم، حدائق أكتوبر', 'السبت - الخميس: 8:00 - 16:00', ARRAY['ترخيص المدارس', 'متابعة المناهج', 'تدريب المعلمين', 'تطوير التعليم']);

-- إدراج بيانات تجريبية للصيدليات
INSERT INTO public.pharmacies (name, description, phone, address, operating_hours, services, languages, parking_available, wheelchair_accessible, home_delivery, emergency_service, rating) VALUES
('صيدلية النهضة', 'صيدلية متكاملة تقدم جميع الخدمات الصيدلانية', '01234567890', 'شارع النهضة، حدائق أكتوبر', '24/7', ARRAY['prescription', 'otc', 'consultation', 'delivery'], ARRAY['العربية', 'الإنجليزية'], true, true, true, true, 4.5),
('صيدلية الشفاء', 'صيدلية متخصصة في الأدوية والمستلزمات الطبية', '01234567891', 'شارع الشفاء، حدائق أكتوبر', 'السبت - الخميس: 8:00 - 22:00', ARRAY['prescription', 'otc', 'medical_supplies'], ARRAY['العربية'], true, false, true, false, 4.2),
('صيدلية الحياة', 'صيدلية حديثة مع خدمات متطورة', '01234567892', 'شارع الحياة، حدائق أكتوبر', 'السبت - الخميس: 9:00 - 21:00', ARRAY['prescription', 'consultation', 'vaccination'], ARRAY['العربية', 'الإنجليزية', 'الفرنسية'], true, true, false, true, 4.8);

-- إنشاء جدول الفنادق
CREATE TABLE public.hotels (
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
CREATE INDEX idx_hotels_active ON public.hotels(is_active);
CREATE INDEX idx_hotels_star_rating ON public.hotels(star_rating);
CREATE INDEX idx_hotels_price_range ON public.hotels(price_range);

-- تمكين RLS للفنادق
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

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
('فندق الحياة', 'فندق اقتصادي مع خدمات أساسية', '01234567892', 'شارع الحياة، حدائق أكتوبر', 'info@haya-hotel.com', 3, 'budget', '14:00', '12:00', ARRAY['wifi', 'parking'], ARRAY['غرفة فردية', 'غرفة مزدوجة']);
