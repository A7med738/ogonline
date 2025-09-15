-- Add performance indexes for malls table
-- This migration adds indexes to improve query performance

-- Add index on created_at for faster ordering
CREATE INDEX IF NOT EXISTS idx_malls_created_at ON malls(created_at DESC);

-- Add index on is_open for filtering open/closed malls
CREATE INDEX IF NOT EXISTS idx_malls_is_open ON malls(is_open);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_malls_created_at_is_open ON malls(created_at DESC, is_open);

-- Add index on rating for sorting by rating
CREATE INDEX IF NOT EXISTS idx_malls_rating ON malls(rating DESC);

-- Optimize existing indexes
-- Ensure all foreign key indexes exist
CREATE INDEX IF NOT EXISTS idx_mall_services_mall_id ON mall_services(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_shops_mall_id ON mall_shops(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_restaurants_mall_id ON mall_restaurants(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_cinema_mall_id ON mall_cinema(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_movies_cinema_id ON mall_movies(cinema_id);
CREATE INDEX IF NOT EXISTS idx_mall_games_mall_id ON mall_games(mall_id);
CREATE INDEX IF NOT EXISTS idx_mall_events_mall_id ON mall_events(mall_id);
