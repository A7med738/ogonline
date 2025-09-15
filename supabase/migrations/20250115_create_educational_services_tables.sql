-- Create educational services tables
-- This migration creates tables for managing educational services including schools, nurseries, centers, and teachers

-- Create schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'international', 'religious')),
  level TEXT NOT NULL CHECK (level IN ('kindergarten', 'primary', 'preparatory', 'secondary', 'all')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  established_year INTEGER,
  capacity INTEGER,
  fees_range TEXT, -- e.g., "1000-5000 جنيه"
  curriculum TEXT, -- e.g., "Egyptian", "American", "British", "IB"
  languages TEXT[], -- e.g., ["Arabic", "English", "French"]
  facilities TEXT[], -- e.g., ["Library", "Lab", "Sports", "Cafeteria"]
  transportation BOOLEAN DEFAULT false,
  boarding BOOLEAN DEFAULT false,
  special_needs BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nurseries table
CREATE TABLE IF NOT EXISTS public.nurseries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('private', 'government', 'community')),
  age_groups TEXT[] NOT NULL, -- e.g., ["6 months - 2 years", "2-4 years"]
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  established_year INTEGER,
  capacity INTEGER,
  fees_range TEXT,
  operating_hours TEXT, -- e.g., "7:00 AM - 4:00 PM"
  facilities TEXT[], -- e.g., ["Playground", "Nursery", "Security", "CCTV"]
  transportation BOOLEAN DEFAULT false,
  meals_included BOOLEAN DEFAULT false,
  medical_care BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create educational centers table
CREATE TABLE IF NOT EXISTS public.educational_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tutoring', 'language', 'computer', 'art', 'music', 'sports', 'religious', 'other')),
  subjects TEXT[], -- e.g., ["Math", "Science", "English", "Arabic"]
  age_groups TEXT[], -- e.g., ["6-12 years", "13-18 years", "Adults"]
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  established_year INTEGER,
  capacity INTEGER,
  fees_range TEXT,
  class_schedule TEXT, -- e.g., "Monday-Friday 4:00-8:00 PM"
  facilities TEXT[], -- e.g., ["Computer Lab", "Library", "Study Rooms"]
  online_classes BOOLEAN DEFAULT false,
  individual_sessions BOOLEAN DEFAULT false,
  group_sessions BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL, -- e.g., "Mathematics", "English", "Science"
  subjects TEXT[] NOT NULL, -- e.g., ["Math", "Physics", "Chemistry"]
  education_level TEXT NOT NULL CHECK (education_level IN ('bachelor', 'master', 'phd', 'diploma')),
  experience_years INTEGER DEFAULT 0,
  phone TEXT,
  email TEXT,
  address TEXT,
  description TEXT,
  image_url TEXT,
  hourly_rate DECIMAL(10,2),
  available_hours TEXT, -- e.g., "4:00-8:00 PM"
  teaching_methods TEXT[], -- e.g., ["Online", "In-person", "Group", "Individual"]
  age_groups TEXT[], -- e.g., ["Primary", "Secondary", "University"]
  languages TEXT[], -- e.g., ["Arabic", "English"]
  qualifications TEXT[], -- e.g., ["Teaching Certificate", "IELTS", "TOEFL"]
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_type ON public.schools(type);
CREATE INDEX IF NOT EXISTS idx_schools_level ON public.schools(level);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON public.schools(is_active);

CREATE INDEX IF NOT EXISTS idx_nurseries_type ON public.nurseries(type);
CREATE INDEX IF NOT EXISTS idx_nurseries_is_active ON public.nurseries(is_active);

CREATE INDEX IF NOT EXISTS idx_educational_centers_type ON public.educational_centers(type);
CREATE INDEX IF NOT EXISTS idx_educational_centers_is_active ON public.educational_centers(is_active);

CREATE INDEX IF NOT EXISTS idx_teachers_specialization ON public.teachers(specialization);
CREATE INDEX IF NOT EXISTS idx_teachers_is_active ON public.teachers(is_active);
CREATE INDEX IF NOT EXISTS idx_teachers_is_verified ON public.teachers(is_verified);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for schools
CREATE POLICY "Anyone can view active schools"
ON public.schools
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all schools"
ON public.schools
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage schools"
ON public.schools
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for nurseries
CREATE POLICY "Anyone can view active nurseries"
ON public.nurseries
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all nurseries"
ON public.nurseries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage nurseries"
ON public.nurseries
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for educational centers
CREATE POLICY "Anyone can view active educational centers"
ON public.educational_centers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all educational centers"
ON public.educational_centers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage educational centers"
ON public.educational_centers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for teachers
CREATE POLICY "Anyone can view active teachers"
ON public.teachers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all teachers"
ON public.teachers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage teachers"
ON public.teachers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_schools_updated_at 
  BEFORE UPDATE ON public.schools 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nurseries_updated_at 
  BEFORE UPDATE ON public.nurseries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educational_centers_updated_at 
  BEFORE UPDATE ON public.educational_centers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at 
  BEFORE UPDATE ON public.teachers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.schools (name, type, level, address, phone, description, established_year, capacity, fees_range, curriculum, languages, facilities, transportation, rating) VALUES 
('مدرسة النور الدولية', 'international', 'all', 'شارع النور، حدائق أكتوبر', '01001234567', 'مدرسة دولية تقدم تعليم متميز', 2010, 500, '15000-25000 جنيه', 'American', ARRAY['Arabic', 'English'], ARRAY['Library', 'Lab', 'Sports', 'Cafeteria'], true, 4.5),
('مدرسة الأمل الابتدائية', 'public', 'primary', 'شارع الأمل، حدائق أكتوبر', '01001234568', 'مدرسة حكومية للتعليم الابتدائي', 2005, 300, 'مجاني', 'Egyptian', ARRAY['Arabic'], ARRAY['Library', 'Sports'], false, 4.0);

INSERT INTO public.nurseries (name, type, age_groups, address, phone, description, established_year, capacity, fees_range, operating_hours, facilities, transportation, meals_included, rating) VALUES 
('حضانة الأزهار', 'private', ARRAY['6 months - 2 years', '2-4 years'], 'شارع الأزهار، حدائق أكتوبر', '01001234569', 'حضانة متخصصة في رعاية الأطفال', 2015, 50, '800-1500 جنيه', '7:00 AM - 4:00 PM', ARRAY['Playground', 'Nursery', 'Security', 'CCTV'], true, true, 4.3),
('حضانة المستقبل', 'community', ARRAY['2-4 years'], 'شارع المستقبل، حدائق أكتوبر', '01001234570', 'حضانة مجتمعية للأطفال', 2018, 30, '500-800 جنيه', '8:00 AM - 3:00 PM', ARRAY['Playground', 'Security'], false, false, 4.1);

INSERT INTO public.educational_centers (name, type, subjects, age_groups, address, phone, description, established_year, capacity, fees_range, class_schedule, facilities, online_classes, individual_sessions, rating) VALUES 
('مركز النجاح التعليمي', 'tutoring', ARRAY['Math', 'Science', 'English'], ARRAY['6-12 years', '13-18 years'], 'شارع النجاح، حدائق أكتوبر', '01001234571', 'مركز تعليمي متخصص في الدروس الخصوصية', 2012, 100, '50-100 جنيه/ساعة', 'Monday-Friday 4:00-8:00 PM', ARRAY['Computer Lab', 'Library', 'Study Rooms'], true, true, 4.4),
('مركز اللغات الحديث', 'language', ARRAY['English', 'French', 'German'], ARRAY['13-18 years', 'Adults'], 'شارع اللغات، حدائق أكتوبر', '01001234572', 'مركز متخصص في تعليم اللغات', 2016, 80, '80-150 جنيه/ساعة', 'Saturday-Thursday 6:00-10:00 PM', ARRAY['Language Lab', 'Library'], true, true, 4.6);

INSERT INTO public.teachers (name, specialization, subjects, education_level, experience_years, phone, description, hourly_rate, available_hours, teaching_methods, age_groups, languages, qualifications, rating, is_verified) VALUES 
('أستاذ أحمد محمد', 'Mathematics', ARRAY['Math', 'Physics'], 'master', 8, '01001234573', 'مدرس رياضيات و فيزياء بخبرة 8 سنوات', 60.00, '4:00-8:00 PM', ARRAY['Online', 'In-person', 'Individual'], ARRAY['Secondary', 'University'], ARRAY['Arabic', 'English'], ARRAY['Teaching Certificate', 'Masters in Math'], 4.7, true),
('أستاذة فاطمة علي', 'English', ARRAY['English', 'Literature'], 'bachelor', 5, '01001234574', 'مدرسة لغة إنجليزية معتمدة', 50.00, '5:00-9:00 PM', ARRAY['Online', 'In-person', 'Group'], ARRAY['Primary', 'Secondary'], ARRAY['Arabic', 'English'], ARRAY['IELTS', 'TOEFL'], 4.5, true);
