-- Add shop view counts system
-- This migration adds view count functionality for mall shops

-- Add view count column to mall_shops table
ALTER TABLE mall_shops 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create shop_views table for detailed view tracking
CREATE TABLE IF NOT EXISTS shop_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES mall_shops(id) ON DELETE CASCADE,
  user_ip TEXT, -- IP address for basic tracking (optional)
  user_agent TEXT, -- User agent for basic tracking (optional)
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT -- Session ID for better tracking (optional)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shop_views_shop_id ON shop_views(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_views_viewed_at ON shop_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_shop_views_session_id ON shop_views(session_id);

-- Create function to increment shop view count
CREATE OR REPLACE FUNCTION increment_shop_view(
  p_shop_id UUID,
  p_user_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_view_count INTEGER;
BEGIN
  -- Insert view record
  INSERT INTO shop_views (shop_id, user_ip, user_agent, session_id)
  VALUES (p_shop_id, p_user_ip, p_user_agent, p_session_id);
  
  -- Update and get the new view count
  UPDATE mall_shops 
  SET view_count = view_count + 1
  WHERE id = p_shop_id
  RETURNING view_count INTO new_view_count;
  
  RETURN COALESCE(new_view_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to get shop view statistics
CREATE OR REPLACE FUNCTION get_shop_view_stats(p_shop_id UUID)
RETURNS TABLE (
  total_views INTEGER,
  today_views INTEGER,
  this_week_views INTEGER,
  this_month_views INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT view_count FROM mall_shops WHERE id = p_shop_id) as total_views,
    (SELECT COUNT(*)::INTEGER FROM shop_views 
     WHERE shop_id = p_shop_id 
     AND viewed_at >= CURRENT_DATE) as today_views,
    (SELECT COUNT(*)::INTEGER FROM shop_views 
     WHERE shop_id = p_shop_id 
     AND viewed_at >= DATE_TRUNC('week', CURRENT_DATE)) as this_week_views,
    (SELECT COUNT(*)::INTEGER FROM shop_views 
     WHERE shop_id = p_shop_id 
     AND viewed_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month_views;
END;
$$ LANGUAGE plpgsql;

-- Create function to get most viewed shops
CREATE OR REPLACE FUNCTION get_most_viewed_shops(
  p_mall_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  shop_id UUID,
  shop_name TEXT,
  view_count INTEGER,
  mall_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as shop_id,
    s.name as shop_name,
    s.view_count,
    m.name as mall_name
  FROM mall_shops s
  LEFT JOIN malls m ON s.mall_id = m.id
  WHERE (p_mall_id IS NULL OR s.mall_id = p_mall_id)
  ORDER BY s.view_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_shop_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_shop_view_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_most_viewed_shops TO anon, authenticated;

-- Enable RLS (Row Level Security) for shop_views table
ALTER TABLE shop_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading shop views (for analytics)
CREATE POLICY "Allow reading shop views" ON shop_views
  FOR SELECT USING (true);

-- Create policy to allow inserting shop views (for tracking)
CREATE POLICY "Allow inserting shop views" ON shop_views
  FOR INSERT WITH CHECK (true);

-- Add comment to document the new functionality
COMMENT ON COLUMN mall_shops.view_count IS 'Total number of views for this shop';
COMMENT ON TABLE shop_views IS 'Detailed view tracking for shops with optional user tracking';
COMMENT ON FUNCTION increment_shop_view IS 'Increments shop view count and logs the view';
COMMENT ON FUNCTION get_shop_view_stats IS 'Returns view statistics for a specific shop';
COMMENT ON FUNCTION get_most_viewed_shops IS 'Returns most viewed shops, optionally filtered by mall';
