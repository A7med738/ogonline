// Local storage for shop ratings
// This file manages shop ratings locally until database is set up

interface ShopRating {
  id: string;
  shop_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const STORAGE_KEY = 'shop_ratings';

export const getShopRatings = (shopId: string): ShopRating[] => {
  try {
    const allRatings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return allRatings.filter((rating: ShopRating) => rating.shop_id === shopId);
  } catch (error) {
    console.error('Error loading shop ratings:', error);
    return [];
  }
};

export const addShopRating = (rating: Omit<ShopRating, 'id' | 'created_at'>): ShopRating => {
  try {
    const allRatings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newRating: ShopRating = {
      ...rating,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    allRatings.push(newRating);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRatings));
    
    return newRating;
  } catch (error) {
    console.error('Error saving shop rating:', error);
    throw error;
  }
};

export const getShopRatingStats = (shopId: string): { averageRating: number; totalRatings: number } => {
  const ratings = getShopRatings(shopId);
  
  if (ratings.length === 0) {
    return { averageRating: 0, totalRatings: 0 };
  }
  
  const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
  
  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    totalRatings: ratings.length
  };
};

export const getAllShopRatings = (): ShopRating[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Error loading all shop ratings:', error);
    return [];
  }
};
