import { supabase } from '../integrations/supabase/client';

/**
 * Track a shop view by incrementing the view count
 * @param shopId - The ID of the shop being viewed
 * @param options - Optional tracking data
 */
export const trackShopView = async (
  shopId: string,
  options?: {
    userIp?: string;
    userAgent?: string;
    sessionId?: string;
  }
): Promise<number | null> => {
  try {
    const { data, error } = await supabase.rpc('increment_shop_view', {
      p_shop_id: shopId,
      p_user_ip: options?.userIp || null,
      p_user_agent: options?.userAgent || null,
      p_session_id: options?.sessionId || null,
    });

    if (error) {
      console.error('Error tracking shop view:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error tracking shop view:', error);
    return null;
  }
};

/**
 * Get view statistics for a specific shop
 * @param shopId - The ID of the shop
 */
export const getShopViewStats = async (shopId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_shop_view_stats', {
      p_shop_id: shopId,
    });

    if (error) {
      console.error('Error getting shop view stats:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error getting shop view stats:', error);
    return null;
  }
};

/**
 * Get most viewed shops
 * @param mallId - Optional mall ID to filter by
 * @param limit - Number of shops to return (default: 10)
 */
export const getMostViewedShops = async (
  mallId?: string,
  limit: number = 10
) => {
  try {
    const { data, error } = await supabase.rpc('get_most_viewed_shops', {
      p_mall_id: mallId || null,
      p_limit: limit,
    });

    if (error) {
      console.error('Error getting most viewed shops:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting most viewed shops:', error);
    return [];
  }
};

/**
 * Generate a simple session ID for tracking
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get user IP address (simplified version)
 * Note: This is a basic implementation. In production, you might want to use a more robust solution
 */
export const getUserIp = (): string => {
  // This is a simplified version. In a real app, you'd get this from your backend
  return 'unknown';
};

/**
 * Get user agent string
 */
export const getUserAgent = (): string => {
  return navigator.userAgent;
};
