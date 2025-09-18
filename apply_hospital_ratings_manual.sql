-- Apply hospital ratings system manually
-- Run this in Supabase SQL Editor

-- Create hospital_ratings table
CREATE TABLE IF NOT EXISTS hospital_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID, -- يمكن ربطه بجدول المستخدمين لاحقاً
  user_name TEXT NOT NULL, -- اسم المستخدم الذي قام بالتقييم
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- التقييم من 1 إلى 5
  comment TEXT, -- تعليق المستخدم
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add average rating columns to hospitals table
ALTER TABLE hospitals 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospital_ratings_hospital_id ON hospital_ratings(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_ratings_user_id ON hospital_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_ratings_created_at ON hospital_ratings(created_at);

-- Create function to update hospital average rating
CREATE OR REPLACE FUNCTION update_hospital_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the hospital's average rating and total ratings count
  UPDATE hospitals 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0.0) 
      FROM hospital_ratings 
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM hospital_ratings 
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
    )
  WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update hospital rating when ratings change
DROP TRIGGER IF EXISTS update_hospital_rating_trigger ON hospital_ratings;
CREATE TRIGGER update_hospital_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON hospital_ratings
  FOR EACH ROW EXECUTE FUNCTION update_hospital_rating();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON hospital_ratings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hospital_ratings TO anon;
GRANT EXECUTE ON FUNCTION update_hospital_rating() TO authenticated;
GRANT EXECUTE ON FUNCTION update_hospital_rating() TO anon;

-- Enable RLS
ALTER TABLE hospital_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to hospital ratings" ON hospital_ratings
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to hospital ratings" ON hospital_ratings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to hospital ratings" ON hospital_ratings
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to hospital ratings" ON hospital_ratings
  FOR DELETE USING (true);

-- Verify the setup
SELECT 'Hospital ratings system created successfully!' as status;
