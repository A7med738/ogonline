import { supabase } from '../integrations/supabase/client';

export interface ShopRating {
  id: string;
  shop_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const getShopRatingsFromDB = async (shopId: string): Promise<ShopRating[]> => {
  try {
    const { data, error } = await supabase
      .from('shop_ratings')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading shop ratings from database:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading shop ratings from database:', error);
    return [];
  }
};

export const addShopRatingToDB = async (rating: Omit<ShopRating, 'id' | 'created_at'>): Promise<ShopRating | null> => {
  try {
    const { data, error } = await supabase
      .from('shop_ratings')
      .insert([rating])
      .select()
      .single();

    if (error) {
      console.error('Error saving shop rating to database:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving shop rating to database:', error);
    return null;
  }
};

export const getShopRatingStatsFromDB = async (shopId: string): Promise<{ averageRating: number; totalRatings: number }> => {
  try {
    const { data, error } = await supabase
      .from('shop_ratings')
      .select('rating')
      .eq('shop_id', shopId);

    if (error) {
      console.error('Error loading shop rating stats from database:', error);
      return { averageRating: 0, totalRatings: 0 };
    }

    if (!data || data.length === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }

    const totalRatings = data.length;
    const averageRating = data.reduce((sum, item) => sum + item.rating, 0) / totalRatings;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings
    };
  } catch (error) {
    console.error('Error loading shop rating stats from database:', error);
    return { averageRating: 0, totalRatings: 0 };
  }
};

export const getAllShopRatingsFromDB = async (): Promise<ShopRating[]> => {
  try {
    const { data, error } = await supabase
      .from('shop_ratings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading all shop ratings from database:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading all shop ratings from database:', error);
    return [];
  }
};
