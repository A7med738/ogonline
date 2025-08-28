-- Create city_departments table
CREATE TABLE public.city_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  hours TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Building',
  color TEXT NOT NULL DEFAULT 'from-blue-500 to-blue-600',
  order_priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.city_departments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view city departments" 
ON public.city_departments 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage city departments" 
ON public.city_departments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_city_departments_updated_at
BEFORE UPDATE ON public.city_departments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.city_departments (title, description, phone, email, hours, icon, color, order_priority) VALUES
('مكتب العمدة', 'المكتب الرئيسي لعمدة المدينة والإدارة العليا', '011-123-4567', 'mayor@city.gov.sa', 'السبت - الخميس: 8:00 - 15:00', 'Building', 'from-blue-500 to-blue-600', 1),
('إدارة الخدمات العامة', 'صيانة الطرق، الإضاءة، النظافة العامة', '011-123-4568', 'services@city.gov.sa', 'السبت - الخميس: 7:00 - 16:00', 'Wrench', 'from-green-500 to-green-600', 2),
('إدارة شؤون المواطنين', 'الشكاوى، التراخيص، والخدمات المدنية', '011-123-4569', 'citizens@city.gov.sa', 'السبت - الخميس: 8:00 - 17:00', 'Users', 'from-purple-500 to-purple-600', 3),
('الإدارة المالية', 'المدفوعات، الرسوم، والخدمات المالية', '011-123-4570', 'finance@city.gov.sa', 'السبت - الخميس: 8:00 - 14:00', 'Banknote', 'from-amber-500 to-amber-600', 4);