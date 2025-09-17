-- =============================================
-- تطبيق آمن للخدمات الجديدة (يتعامل مع الجداول الموجودة)
-- =============================================

-- 1. إنشاء الجداول فقط إذا لم تكن موجودة
CREATE TABLE IF NOT EXISTS public.gas_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,
  operating_hours TEXT,
  services TEXT[],
  image_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gas_company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,
  operating_hours TEXT,
  services TEXT[],
  booking_url TEXT,
  image_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.electricity_company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,
  operating_hours TEXT,
  services TEXT[],
  image_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إنشاء الفهارس فقط إذا لم تكن موجودة
CREATE INDEX IF NOT EXISTS idx_gas_stations_active ON public.gas_stations(is_active);
CREATE INDEX IF NOT EXISTS idx_gas_stations_location ON public.gas_stations(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_gas_company_active ON public.gas_company(is_active);
CREATE INDEX IF NOT EXISTS idx_gas_company_location ON public.gas_company(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_electricity_company_active ON public.electricity_company(is_active);
CREATE INDEX IF NOT EXISTS idx_electricity_company_location ON public.electricity_company(latitude, longitude);

-- 3. تمكين RLS فقط إذا لم يكن مفعلاً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'gas_stations' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.gas_stations ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'gas_company' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.gas_company ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'electricity_company' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.electricity_company ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. حذف السياسات الموجودة أولاً ثم إنشاء الجديدة
DROP POLICY IF EXISTS "Anyone can view active gas stations" ON public.gas_stations;
DROP POLICY IF EXISTS "Admins can manage all gas stations" ON public.gas_stations;

DROP POLICY IF EXISTS "Anyone can view active gas company branches" ON public.gas_company;
DROP POLICY IF EXISTS "Admins can manage all gas company branches" ON public.gas_company;

DROP POLICY IF EXISTS "Anyone can view active electricity company branches" ON public.electricity_company;
DROP POLICY IF EXISTS "Admins can manage all electricity company branches" ON public.electricity_company;

-- 5. إنشاء السياسات الجديدة
CREATE POLICY "Anyone can view active gas stations" ON public.gas_stations 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all gas stations" ON public.gas_stations 
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active gas company branches" ON public.gas_company 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all gas company branches" ON public.gas_company 
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active electricity company branches" ON public.electricity_company 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all electricity company branches" ON public.electricity_company 
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. إدراج البيانات التجريبية فقط إذا لم تكن موجودة
INSERT INTO public.gas_stations (name, description, address, latitude, longitude, operating_hours, services) 
SELECT * FROM (VALUES
  ('محطة وقود النهضة', 'محطة وقود حديثة مع جميع الخدمات', 'شارع النهضة، حدائق أكتوبر', 30.0444, 31.2357, '24/7', ARRAY['بنزين 92', 'بنزين 95', 'ديزل', 'غاز طبيعي', 'خدمة السيارات', 'مطعم', 'صيدلية']),
  ('محطة وقود الشفاء', 'محطة وقود متكاملة', 'شارع الشفاء، حدائق أكتوبر', 30.0454, 31.2367, '24/7', ARRAY['بنزين 92', 'بنزين 95', 'ديزل', 'خدمة السيارات', 'سوبر ماركت']),
  ('محطة وقود الحياة', 'محطة وقود اقتصادية', 'شارع الحياة، حدائق أكتوبر', 30.0464, 31.2377, 'السبت - الخميس: 6:00 - 24:00', ARRAY['بنزين 92', 'بنزين 95', 'ديزل'])
) AS v(name, description, address, latitude, longitude, operating_hours, services)
WHERE NOT EXISTS (SELECT 1 FROM public.gas_stations WHERE name = v.name);

INSERT INTO public.gas_company (name, description, phone, address, latitude, longitude, operating_hours, services, booking_url) 
SELECT * FROM (VALUES
  ('فرع شركة الغاز الرئيسي', 'الفرع الرئيسي لشركة الغاز في المدينة', '01234567890', 'شارع الغاز، حدائق أكتوبر', 30.0444, 31.2357, 'السبت - الخميس: 8:00 - 16:00', ARRAY['تركيب الغاز', 'صيانة الغاز', 'تسجيل عداد جديد', 'تغيير العداد', 'خدمات الطوارئ'], 'https://gas-company-booking.com'),
  ('فرع شركة الغاز - المنطقة الشمالية', 'فرع متخصص في المنطقة الشمالية', '01234567891', 'شارع الشمال، حدائق أكتوبر', 30.0454, 31.2367, 'السبت - الخميس: 8:00 - 15:00', ARRAY['تركيب الغاز', 'صيانة الغاز', 'تسجيل عداد جديد'], 'https://gas-company-booking.com'),
  ('فرع شركة الغاز - المنطقة الجنوبية', 'فرع متخصص في المنطقة الجنوبية', '01234567892', 'شارع الجنوب، حدائق أكتوبر', 30.0464, 31.2377, 'السبت - الخميس: 8:00 - 15:00', ARRAY['تركيب الغاز', 'صيانة الغاز', 'تغيير العداد', 'خدمات الطوارئ'], 'https://gas-company-booking.com')
) AS v(name, description, phone, address, latitude, longitude, operating_hours, services, booking_url)
WHERE NOT EXISTS (SELECT 1 FROM public.gas_company WHERE name = v.name);

INSERT INTO public.electricity_company (name, description, phone, address, latitude, longitude, operating_hours, services) 
SELECT * FROM (VALUES
  ('فرع شركة الكهرباء الرئيسي', 'الفرع الرئيسي لشركة الكهرباء في المدينة', '01234567890', 'شارع الكهرباء، حدائق أكتوبر', 30.0444, 31.2357, 'السبت - الخميس: 8:00 - 16:00', ARRAY['تركيب الكهرباء', 'صيانة الكهرباء', 'تسجيل عداد جديد', 'تغيير العداد', 'خدمات الطوارئ', 'فواتير الكهرباء']),
  ('فرع شركة الكهرباء - المنطقة الشرقية', 'فرع متخصص في المنطقة الشرقية', '01234567891', 'شارع الشرق، حدائق أكتوبر', 30.0454, 31.2367, 'السبت - الخميس: 8:00 - 15:00', ARRAY['تركيب الكهرباء', 'صيانة الكهرباء', 'تسجيل عداد جديد', 'فواتير الكهرباء']),
  ('فرع شركة الكهرباء - المنطقة الغربية', 'فرع متخصص في المنطقة الغربية', '01234567892', 'شارع الغرب، حدائق أكتوبر', 30.0464, 31.2377, 'السبت - الخميس: 8:00 - 15:00', ARRAY['تركيب الكهرباء', 'صيانة الكهرباء', 'تغيير العداد', 'خدمات الطوارئ', 'فواتير الكهرباء'])
) AS v(name, description, phone, address, latitude, longitude, operating_hours, services)
WHERE NOT EXISTS (SELECT 1 FROM public.electricity_company WHERE name = v.name);
