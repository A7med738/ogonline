-- =============================================
-- إصلاح تعارض السياسات الموجودة
-- =============================================

-- 1. حذف السياسات الموجودة أولاً
DROP POLICY IF EXISTS "Anyone can view active gas stations" ON public.gas_stations;
DROP POLICY IF EXISTS "Admins can manage all gas stations" ON public.gas_stations;

DROP POLICY IF EXISTS "Anyone can view active gas company branches" ON public.gas_company;
DROP POLICY IF EXISTS "Admins can manage all gas company branches" ON public.gas_company;

DROP POLICY IF EXISTS "Anyone can view active electricity company branches" ON public.electricity_company;
DROP POLICY IF EXISTS "Admins can manage all electricity company branches" ON public.electricity_company;

-- 2. إنشاء السياسات الجديدة
-- محطات الوقود
CREATE POLICY "Anyone can view active gas stations" ON public.gas_stations 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all gas stations" ON public.gas_stations 
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- شركة الغاز
CREATE POLICY "Anyone can view active gas company branches" ON public.gas_company 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all gas company branches" ON public.gas_company 
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- شركة الكهرباء
CREATE POLICY "Anyone can view active electricity company branches" ON public.electricity_company 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all electricity company branches" ON public.electricity_company 
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
