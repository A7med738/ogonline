-- Create city services tables
-- This migration creates tables for managing city services including ATMs, banks, youth clubs, events, and post offices

-- Create ATMs table
CREATE TABLE IF NOT EXISTS public.atms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  phone TEXT,
  services TEXT[], -- e.g., ["Cash Withdrawal", "Balance Inquiry", "Deposit", "Transfer"]
  operating_hours TEXT, -- e.g., "24/7" or "6:00 AM - 10:00 PM"
  accessibility_features TEXT[], -- e.g., ["Wheelchair Accessible", "Audio Instructions", "Braille"]
  languages TEXT[], -- e.g., ["Arabic", "English"]
  fees TEXT, -- e.g., "Free for bank customers, 5 جنيه for others"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create banks table
CREATE TABLE IF NOT EXISTS public.banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('commercial', 'islamic', 'investment', 'development', 'central')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  logo_url TEXT,
  established_year INTEGER,
  operating_hours TEXT,
  services TEXT[], -- e.g., ["Personal Banking", "Business Banking", "Loans", "Investment", "Insurance"]
  languages TEXT[], -- e.g., ["Arabic", "English", "French"]
  atm_available BOOLEAN DEFAULT true,
  parking_available BOOLEAN DEFAULT false,
  wheelchair_accessible BOOLEAN DEFAULT false,
  online_banking BOOLEAN DEFAULT true,
  mobile_banking BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create youth_clubs table
CREATE TABLE IF NOT EXISTS public.youth_clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sports_club', 'cultural_center', 'youth_center', 'community_center', 'recreation_center', 'art_center')),
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
  age_groups TEXT[], -- e.g., ["6-12 years", "13-18 years", "18-25 years", "All ages"]
  activities TEXT[], -- e.g., ["Football", "Basketball", "Swimming", "Art", "Music", "Drama"]
  facilities TEXT[], -- e.g., ["Gym", "Swimming Pool", "Library", "Computer Lab", "Cafeteria"]
  membership_required BOOLEAN DEFAULT true,
  membership_fee DECIMAL(10,2),
  free_activities BOOLEAN DEFAULT false,
  languages TEXT[], -- e.g., ["Arabic", "English"]
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('sports', 'cultural', 'educational', 'entertainment', 'religious', 'community', 'business', 'art', 'music', 'other')),
  venue TEXT,
  address TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  start_time TIME,
  end_time TIME,
  organizer TEXT,
  organizer_phone TEXT,
  organizer_email TEXT,
  image_url TEXT,
  ticket_price DECIMAL(10,2),
  is_free BOOLEAN DEFAULT false,
  age_restriction TEXT, -- e.g., "18+", "All ages", "Children only"
  capacity INTEGER,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  languages TEXT[], -- e.g., ["Arabic", "English"]
  tags TEXT[], -- e.g., ["Family Friendly", "Outdoor", "Indoor", "Educational"]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_offices table
CREATE TABLE IF NOT EXISTS public.post_offices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  image_url TEXT,
  established_year INTEGER,
  operating_hours TEXT,
  services TEXT[], -- e.g., ["Mail Delivery", "Parcel Service", "Money Transfer", "Bill Payment", "Passport Services"]
  languages TEXT[], -- e.g., ["Arabic", "English"]
  parking_available BOOLEAN DEFAULT false,
  wheelchair_accessible BOOLEAN DEFAULT false,
  atm_available BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_atms_bank_name ON public.atms(bank_name);
CREATE INDEX IF NOT EXISTS idx_atms_is_active ON public.atms(is_active);

CREATE INDEX IF NOT EXISTS idx_banks_type ON public.banks(type);
CREATE INDEX IF NOT EXISTS idx_banks_is_active ON public.banks(is_active);

CREATE INDEX IF NOT EXISTS idx_youth_clubs_type ON public.youth_clubs(type);
CREATE INDEX IF NOT EXISTS idx_youth_clubs_is_active ON public.youth_clubs(is_active);

CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);

CREATE INDEX IF NOT EXISTS idx_post_offices_is_active ON public.post_offices(is_active);

-- Enable RLS
ALTER TABLE public.atms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_offices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ATMs
CREATE POLICY "Anyone can view active ATMs"
ON public.atms
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all ATMs"
ON public.atms
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage ATMs"
ON public.atms
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for banks
CREATE POLICY "Anyone can view active banks"
ON public.banks
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all banks"
ON public.banks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage banks"
ON public.banks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for youth clubs
CREATE POLICY "Anyone can view active youth clubs"
ON public.youth_clubs
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all youth clubs"
ON public.youth_clubs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage youth clubs"
ON public.youth_clubs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for events
CREATE POLICY "Anyone can view active events"
ON public.events
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage events"
ON public.events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for post offices
CREATE POLICY "Anyone can view active post offices"
ON public.post_offices
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can view all post offices"
ON public.post_offices
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage post offices"
ON public.post_offices
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_atms_updated_at 
  BEFORE UPDATE ON public.atms 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banks_updated_at 
  BEFORE UPDATE ON public.banks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_youth_clubs_updated_at 
  BEFORE UPDATE ON public.youth_clubs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON public.events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_offices_updated_at 
  BEFORE UPDATE ON public.post_offices 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.atms (name, bank_name, address, phone, services, operating_hours, accessibility_features, languages, fees, is_active) VALUES 
('صراف البنك الأهلي - حدائق أكتوبر', 'البنك الأهلي المصري', 'شارع النيل، حدائق أكتوبر', '0112345700', ARRAY['Cash Withdrawal', 'Balance Inquiry', 'Deposit', 'Transfer'], '24/7', ARRAY['Wheelchair Accessible', 'Audio Instructions'], ARRAY['Arabic', 'English'], 'مجاني لعملاء البنك، 5 جنيه للآخرين', true),
('صراف البنك التجاري - حدائق أكتوبر', 'البنك التجاري الدولي', 'شارع التجارة، حدائق أكتوبر', '0112345701', ARRAY['Cash Withdrawal', 'Balance Inquiry', 'Deposit'], '6:00 AM - 10:00 PM', ARRAY['Wheelchair Accessible'], ARRAY['Arabic', 'English'], 'مجاني لعملاء البنك، 3 جنيه للآخرين', true);

INSERT INTO public.banks (name, type, address, phone, email, website, description, established_year, operating_hours, services, languages, atm_available, parking_available, wheelchair_accessible, online_banking, mobile_banking, rating) VALUES 
('البنك الأهلي المصري - فرع حدائق أكتوبر', 'commercial', 'شارع النيل، حدائق أكتوبر', '0112345702', 'october@nbe.com.eg', 'www.nbe.com.eg', 'فرع البنك الأهلي المصري في حدائق أكتوبر', 1898, '8:00 AM - 3:00 PM', ARRAY['Personal Banking', 'Business Banking', 'Loans', 'Investment', 'Insurance'], ARRAY['Arabic', 'English'], true, true, true, true, true, 4.5),
('البنك التجاري الدولي - فرع حدائق أكتوبر', 'commercial', 'شارع التجارة، حدائق أكتوبر', '0112345703', 'october@cib.com.eg', 'www.cib.com.eg', 'فرع البنك التجاري الدولي في حدائق أكتوبر', 1975, '8:00 AM - 3:00 PM', ARRAY['Personal Banking', 'Business Banking', 'Loans', 'Investment'], ARRAY['Arabic', 'English'], true, true, true, true, true, 4.3);

INSERT INTO public.youth_clubs (name, type, address, phone, email, website, description, established_year, capacity, operating_hours, age_groups, activities, facilities, membership_required, membership_fee, free_activities, languages, rating) VALUES 
('نادي حدائق أكتوبر الرياضي', 'sports_club', 'شارع الرياضة، حدائق أكتوبر', '0112345704', 'sports@octoberclub.com', 'www.octoberclub.com', 'نادي رياضي متكامل يخدم شباب حدائق أكتوبر', 2010, 500, '6:00 AM - 10:00 PM', ARRAY['6-12 years', '13-18 years', '18-25 years', 'All ages'], ARRAY['Football', 'Basketball', 'Swimming', 'Tennis', 'Gym'], ARRAY['Football Field', 'Basketball Court', 'Swimming Pool', 'Tennis Court', 'Gym', 'Cafeteria'], true, 200.00, true, ARRAY['Arabic', 'English'], 4.6),
('مركز الشباب الثقافي', 'cultural_center', 'شارع الثقافة، حدائق أكتوبر', '0112345705', 'culture@youthcenter.com', 'www.youthcenter.com', 'مركز ثقافي للشباب يقدم أنشطة متنوعة', 2015, 200, '9:00 AM - 9:00 PM', ARRAY['13-18 years', '18-25 years'], ARRAY['Art', 'Music', 'Drama', 'Literature', 'Photography'], ARRAY['Art Studio', 'Music Room', 'Theater', 'Library', 'Computer Lab'], true, 100.00, true, ARRAY['Arabic', 'English'], 4.4);

INSERT INTO public.events (title, description, event_type, venue, address, start_date, end_date, start_time, end_time, organizer, organizer_phone, organizer_email, ticket_price, is_free, age_restriction, capacity, registration_required, languages, tags, is_active) VALUES 
('مهرجان الربيع الثقافي', 'مهرجان ثقافي سنوي يضم عروض فنية وموسيقية متنوعة', 'cultural', 'ساحة حدائق أكتوبر', 'ساحة حدائق أكتوبر، حدائق أكتوبر', '2024-03-15 00:00:00+00', '2024-03-17 00:00:00+00', '18:00:00', '22:00:00', 'جمعية حدائق أكتوبر الثقافية', '0112345706', 'events@octoberculture.com', 50.00, false, 'All ages', 1000, true, ARRAY['Arabic', 'English'], ARRAY['Family Friendly', 'Outdoor', 'Cultural'], true),
('بطولة كرة القدم للشباب', 'بطولة كرة قدم للشباب من 16-25 سنة', 'sports', 'ملعب حدائق أكتوبر', 'ملعب حدائق أكتوبر، حدائق أكتوبر', '2024-04-01 00:00:00+00', '2024-04-30 00:00:00+00', '17:00:00', '19:00:00', 'نادي حدائق أكتوبر الرياضي', '0112345704', 'sports@octoberclub.com', 0.00, true, '16-25 years', 200, true, ARRAY['Arabic'], ARRAY['Sports', 'Outdoor', 'Competition'], true);

INSERT INTO public.post_offices (name, address, phone, email, description, established_year, operating_hours, services, languages, parking_available, wheelchair_accessible, atm_available, rating) VALUES 
('مكتب بريد حدائق أكتوبر', 'شارع البريد، حدائق أكتوبر', '0112345707', 'october@post.eg', 'مكتب بريد يخدم منطقة حدائق أكتوبر', 2000, '8:00 AM - 4:00 PM', ARRAY['Mail Delivery', 'Parcel Service', 'Money Transfer', 'Bill Payment'], ARRAY['Arabic', 'English'], true, true, true, 4.2),
('مكتب بريد حدائق أكتوبر الفرعي', 'شارع الفرع، حدائق أكتوبر', '0112345708', 'october2@post.eg', 'مكتب بريد فرعي في حدائق أكتوبر', 2015, '8:00 AM - 2:00 PM', ARRAY['Mail Delivery', 'Parcel Service', 'Bill Payment'], ARRAY['Arabic'], false, false, false, 4.0);
