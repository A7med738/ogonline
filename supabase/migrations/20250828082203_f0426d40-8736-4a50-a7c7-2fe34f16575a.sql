-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    number TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    available BOOLEAN NOT NULL DEFAULT true,
    order_priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for emergency_contacts
CREATE POLICY "Anyone can view emergency contacts"
ON public.emergency_contacts
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage emergency contacts"
ON public.emergency_contacts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update news table policies for admin management
CREATE POLICY "Admins can manage news"
ON public.news
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for emergency_contacts
CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample emergency contacts data
INSERT INTO public.emergency_contacts (title, number, description, type, available, order_priority) VALUES
('رقم الطوارئ العام', '911', 'للحالات الطارئة العامة والحوادث الخطيرة', 'emergency', true, 1),
('الشرطة', '999', 'للتبليغ عن الجرائم والحوادث الأمنية', 'police', true, 2),
('الإسعاف', '997', 'للحالات الطبية الطارئة', 'medical', true, 3),
('الإطفاء', '998', 'لحوادث الحريق والإنقاذ', 'fire', true, 4),
('مركز الشرطة الرئيسي', '+966112345678', 'مفتوح 24 ساعة لجميع الخدمات الأمنية', 'station', true, 5),
('قسم المرور', '+966112345679', 'للتبليغ عن حوادث المرور والمخالفات', 'traffic', true, 6);