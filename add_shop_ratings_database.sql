-- Add shop ratings system to database
-- This migration adds rating functionality for mall shops

-- Create shop_ratings table
CREATE TABLE IF NOT EXISTS shop_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES mall_shops(id) ON DELETE CASCADE,
  user_id UUID, -- يمكن ربطه بجدول المستخدمين لاحقاً
  user_name TEXT NOT NULL, -- اسم المستخدم الذي قام بالتقييم
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- التقييم من 1 إلى 5
  comment TEXT, -- تعليق المستخدم
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add average rating columns to mall_shops table
ALTER TABLE mall_shops 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shop_ratings_shop_id ON shop_ratings(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_ratings_user_id ON shop_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_ratings_created_at ON shop_ratings(created_at);

-- Create function to update shop average rating
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the shop's average rating and total ratings count
  UPDATE mall_shops 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0.0) 
      FROM shop_ratings 
      WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM shop_ratings 
      WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    )
  WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update shop rating when ratings change
DROP TRIGGER IF EXISTS update_shop_rating_trigger ON shop_ratings;
CREATE TRIGGER update_shop_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON shop_ratings
  FOR EACH ROW EXECUTE FUNCTION update_shop_rating();

-- Enable RLS (Row Level Security) for shop_ratings table
ALTER TABLE shop_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading shop ratings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shop_ratings' 
    AND policyname = 'Allow reading shop ratings'
  ) THEN
    CREATE POLICY "Allow reading shop ratings" ON shop_ratings
      FOR SELECT USING (true);
  END IF;
END $$;

-- Create policy to allow inserting shop ratings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'shop_ratings' 
    AND policyname = 'Allow inserting shop ratings'
  ) THEN
    CREATE POLICY "Allow inserting shop ratings" ON shop_ratings
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_shop_rating TO anon, authenticated;

-- Add comments to document the functionality
COMMENT ON TABLE shop_ratings IS 'Shop ratings and reviews from users';
COMMENT ON COLUMN shop_ratings.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN shop_ratings.user_name IS 'Name of the user who submitted the rating';
COMMENT ON COLUMN mall_shops.average_rating IS 'Average rating for this shop';
COMMENT ON COLUMN mall_shops.total_ratings IS 'Total number of ratings for this shop';
