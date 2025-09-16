-- Add shop ratings system
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

-- Add average rating column to mall_shops table
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
CREATE TRIGGER update_shop_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON shop_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_rating();

-- Create updated_at trigger for shop_ratings
CREATE TRIGGER update_shop_ratings_updated_at 
  BEFORE UPDATE ON shop_ratings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample ratings for existing shops (optional)
-- يمكن إضافة بيانات تجريبية هنا لاختبار النظام
