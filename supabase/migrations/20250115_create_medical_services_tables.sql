-- Create medical services tables
-- This migration creates tables for managing medical services including hospitals, clinics, health units, and medical centers

-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'specialized', 'university')),
  level TEXT NOT NULL CHECK (level IN ('primary', 'secondary', 'tertiary', 'quaternary')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  established_year INTEGER,
  bed_capacity INTEGER,
  emergency_services BOOLEAN DEFAULT true,
  icu_available BOOLEAN DEFAULT false,
  surgery_available BOOLEAN DEFAULT false,
  pediatrics_available BOOLEAN DEFAULT false,
  maternity_available BOOLEAN DEFAULT false,
  cardiology_available BOOLEAN DEFAULT false,
  neurology_available BOOLEAN DEFAULT false,
  oncology_available BOOLEAN DEFAULT false,
  specialties TEXT[], -- e.g., ["Cardiology", "Neurology", "Oncology"]
  insurance_accepted TEXT[], -- e.g., ["Takaful", "Bupa", "MedGulf"]
  operating_hours TEXT, -- e.g., "24/7" or "8:00 AM - 10:00 PM"
  emergency_phone TEXT,
  ambulance_available BOOLEAN DEFAULT false,
  parking_available BOOLEAN DEFAULT false,
  pharmacy_available BOOLEAN DEFAULT false,
  lab_services BOOLEAN DEFAULT false,
  radiology_services BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinics table
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'specialized', 'dental', 'dermatology', 'ophthalmology', 'cardiology', 'neurology', 'orthopedics', 'pediatrics', 'gynecology', 'psychiatry', 'other')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  doctor_name TEXT,
  doctor_qualification TEXT,
  doctor_specialization TEXT,
  consultation_fee DECIMAL(10,2),
  established_year INTEGER,
  operating_hours TEXT, -- e.g., "9:00 AM - 5:00 PM"
  appointment_required BOOLEAN DEFAULT true,
  walk_in_accepted BOOLEAN DEFAULT false,
  insurance_accepted TEXT[], -- e.g., ["Takaful", "Bupa", "MedGulf"]
  services TEXT[], -- e.g., ["Consultation", "Diagnosis", "Treatment", "Follow-up"]
  equipment TEXT[], -- e.g., ["X-Ray", "Ultrasound", "ECG", "Blood Test"]
  languages TEXT[], -- e.g., ["Arabic", "English", "French"]
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_units table
CREATE TABLE IF NOT EXISTS public.health_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('primary_health_center', 'family_medicine', 'community_health', 'preventive_medicine', 'maternal_child_health', 'school_health', 'occupational_health')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  established_year INTEGER,
  capacity INTEGER, -- number of patients per day
  operating_hours TEXT, -- e.g., "8:00 AM - 4:00 PM"
  services TEXT[], -- e.g., ["Vaccination", "Health Check", "Family Planning", "Prenatal Care"]
  target_groups TEXT[], -- e.g., ["Children", "Adults", "Elderly", "Pregnant Women"]
  vaccination_available BOOLEAN DEFAULT false,
  family_planning BOOLEAN DEFAULT false,
  prenatal_care BOOLEAN DEFAULT false,
  child_health BOOLEAN DEFAULT false,
  chronic_disease_management BOOLEAN DEFAULT false,
  health_education BOOLEAN DEFAULT false,
  free_services BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_centers table
CREATE TABLE IF NOT EXISTS public.medical_centers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('diagnostic_center', 'imaging_center', 'laboratory', 'rehabilitation_center', 'dialysis_center', 'cancer_center', 'cardiac_center', 'eye_center', 'dental_center', 'mental_health_center', 'other')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  established_year INTEGER,
  capacity INTEGER,
  operating_hours TEXT,
  services TEXT[], -- e.g., ["MRI", "CT Scan", "Ultrasound", "Blood Tests", "X-Ray"]
  equipment TEXT[], -- e.g., ["MRI Machine", "CT Scanner", "Ultrasound", "X-Ray Machine"]
  specialties TEXT[], -- e.g., ["Radiology", "Pathology", "Cardiology", "Neurology"]
  appointment_required BOOLEAN DEFAULT true,
  walk_in_accepted BOOLEAN DEFAULT false,
  insurance_accepted TEXT[],
  languages TEXT[],
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospitals_type ON public.hospitals(type);
CREATE INDEX IF NOT EXISTS idx_hospitals_level ON public.hospitals(level);
CREATE INDEX IF NOT EXISTS idx_hospitals_is_active ON public.hospitals(is_active);

CREATE INDEX IF NOT EXISTS idx_clinics_type ON public.clinics(type);
CREATE INDEX IF NOT EXISTS idx_clinics_is_active ON public.clinics(is_active);

CREATE INDEX IF NOT EXISTS idx_health_units_type ON public.health_units(type);
CREATE INDEX IF NOT EXISTS idx_health_units_is_active ON public.health_units(is_active);

CREATE INDEX IF NOT EXISTS idx_medical_centers_type ON public.medical_centers(type);
CREATE INDEX IF NOT EXISTS idx_medical_centers_is_active ON public.medical_centers(is_active);

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_centers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hospitals
CREATE POLICY "Anyone can view active hospitals"
ON public.hospitals
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all hospitals"
ON public.hospitals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage hospitals"
ON public.hospitals
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for clinics
CREATE POLICY "Anyone can view active clinics"
ON public.clinics
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all clinics"
ON public.clinics
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage clinics"
ON public.clinics
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for health units
CREATE POLICY "Anyone can view active health units"
ON public.health_units
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all health units"
ON public.health_units
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage health units"
ON public.health_units
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for medical centers
CREATE POLICY "Anyone can view active medical centers"
ON public.medical_centers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all medical centers"
ON public.medical_centers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage medical centers"
ON public.medical_centers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_hospitals_updated_at 
  BEFORE UPDATE ON public.hospitals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at 
  BEFORE UPDATE ON public.clinics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_units_updated_at 
  BEFORE UPDATE ON public.health_units 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_centers_updated_at 
  BEFORE UPDATE ON public.medical_centers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.hospitals (name, type, level, address, phone, description, established_year, bed_capacity, emergency_services, icu_available, surgery_available, specialties, insurance_accepted, operating_hours, emergency_phone, ambulance_available, rating) VALUES 
('مستشفى الملك فهد', 'public', 'tertiary', 'شارع الملك فهد، حدائق أكتوبر', '0112345678', 'مستشفى حكومي متخصص في الرعاية الطبية الشاملة', 1985, 500, true, true, true, ARRAY['Cardiology', 'Neurology', 'Oncology', 'Pediatrics'], ARRAY['Takaful', 'Bupa', 'MedGulf'], '24/7', '0112345679', true, 4.3),
('مستشفى النور التخصصي', 'private', 'secondary', 'شارع النور، حدائق أكتوبر', '0112345680', 'مستشفى خاص متخصص في الجراحة والعلاج', 2010, 200, true, true, true, ARRAY['Surgery', 'Orthopedics', 'Cardiology'], ARRAY['Takaful', 'Bupa'], '24/7', '0112345681', true, 4.5);

INSERT INTO public.clinics (name, type, address, phone, description, doctor_name, doctor_qualification, doctor_specialization, consultation_fee, operating_hours, appointment_required, insurance_accepted, services, equipment, languages, rating) VALUES 
('عيادة القلب المتخصصة', 'cardiology', 'شارع القلب، حدائق أكتوبر', '0112345682', 'عيادة متخصصة في أمراض القلب والشرايين', 'د. أحمد محمد', 'دكتوراه في أمراض القلب', 'أمراض القلب والشرايين', 200.00, '9:00 AM - 5:00 PM', true, ARRAY['Takaful', 'Bupa'], ARRAY['Consultation', 'ECG', 'Echocardiogram'], ARRAY['ECG Machine', 'Echocardiogram'], ARRAY['Arabic', 'English'], 4.6),
('عيادة الأسنان الحديثة', 'dental', 'شارع الأسنان، حدائق أكتوبر', '0112345683', 'عيادة متخصصة في طب الأسنان', 'د. فاطمة علي', 'ماجستير في طب الأسنان', 'طب الأسنان التجميلي', 150.00, '8:00 AM - 8:00 PM', true, ARRAY['Takaful'], ARRAY['Cleaning', 'Filling', 'Crown', 'Implant'], ARRAY['Dental Chair', 'X-Ray'], ARRAY['Arabic', 'English'], 4.4);

INSERT INTO public.health_units (name, type, address, phone, description, established_year, capacity, operating_hours, services, target_groups, vaccination_available, family_planning, prenatal_care, child_health, free_services, rating) VALUES 
('الوحدة الصحية الأولى', 'primary_health_center', 'شارع الصحة، حدائق أكتوبر', '0112345684', 'وحدة صحية أساسية تقدم خدمات الرعاية الأولية', 2000, 100, '8:00 AM - 4:00 PM', ARRAY['Vaccination', 'Health Check', 'Family Planning', 'Prenatal Care'], ARRAY['Children', 'Adults', 'Elderly', 'Pregnant Women'], true, true, true, true, true, 4.2),
('مركز صحة المجتمع', 'community_health', 'شارع المجتمع، حدائق أكتوبر', '0112345685', 'مركز صحة مجتمعي يخدم المنطقة المحلية', 2015, 80, '7:00 AM - 3:00 PM', ARRAY['Health Education', 'Chronic Disease Management', 'Vaccination'], ARRAY['Adults', 'Elderly'], true, false, false, false, true, 4.0);

INSERT INTO public.medical_centers (name, type, address, phone, description, established_year, capacity, operating_hours, services, equipment, specialties, appointment_required, insurance_accepted, languages, rating) VALUES 
('مركز الأشعة المتقدم', 'imaging_center', 'شارع الأشعة، حدائق أكتوبر', '0112345686', 'مركز متخصص في التصوير الطبي', 2018, 50, '8:00 AM - 10:00 PM', ARRAY['MRI', 'CT Scan', 'Ultrasound', 'X-Ray'], ARRAY['MRI Machine', 'CT Scanner', 'Ultrasound', 'X-Ray Machine'], ARRAY['Radiology', 'Cardiology'], true, ARRAY['Takaful', 'Bupa', 'MedGulf'], ARRAY['Arabic', 'English'], 4.7),
('مختبر التحاليل الطبية', 'laboratory', 'شارع المختبر، حدائق أكتوبر', '0112345687', 'مختبر متخصص في التحاليل الطبية', 2012, 30, '6:00 AM - 8:00 PM', ARRAY['Blood Tests', 'Urine Tests', 'Microbiology', 'Biochemistry'], ARRAY['Blood Analyzer', 'Microscope', 'Centrifuge'], ARRAY['Pathology', 'Microbiology'], false, ARRAY['Takaful', 'Bupa'], ARRAY['Arabic', 'English'], 4.3);
