// Local storage for clinic ratings
// This file manages clinic ratings locally until database is set up

interface ClinicRating {
  id: string;
  clinic_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const STORAGE_KEY = 'clinic_ratings';

export const getClinicRatings = (clinicId: string): ClinicRating[] => {
  try {
    const allRatings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return allRatings.filter((rating: ClinicRating) => rating.clinic_id === clinicId);
  } catch (error) {
    console.error('Error loading clinic ratings:', error);
    return [];
  }
};

export const addClinicRating = (rating: Omit<ClinicRating, 'id' | 'created_at'>): ClinicRating => {
  try {
    const allRatings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newRating: ClinicRating = {
      ...rating,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    allRatings.push(newRating);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRatings));
    
    return newRating;
  } catch (error) {
    console.error('Error saving clinic rating:', error);
    throw error;
  }
};

export const getClinicRatingStats = (clinicId: string): { averageRating: number; totalRatings: number } => {
  const ratings = getClinicRatings(clinicId);
  
  if (ratings.length === 0) {
    return { averageRating: 0, totalRatings: 0 };
  }
  
  const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
  
  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    totalRatings: ratings.length
  };
};

export const getAllClinicRatings = (): ClinicRating[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Error loading all clinic ratings:', error);
    return [];
  }
};
