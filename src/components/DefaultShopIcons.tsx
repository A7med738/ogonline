import React from 'react';

interface DefaultShopIconProps {
  category: string;
  className?: string;
}

const DefaultShopIcon: React.FC<DefaultShopIconProps> = ({ category, className = '' }) => {
  const getIconForCategory = (cat: string) => {
    const categoryLower = cat.toLowerCase();
    
    if (categoryLower.includes('سوبر ماركت') || categoryLower.includes('ماركت')) {
      return '🛒';
    } else if (categoryLower.includes('خضار') || categoryLower.includes('فواكه')) {
      return '🥬';
    } else if (categoryLower.includes('دواجن') || categoryLower.includes('طيور')) {
      return '🐔';
    } else if (categoryLower.includes('مخبز')) {
      return '🥖';
    } else if (categoryLower.includes('مأكولات بحرية') || categoryLower.includes('أسماك')) {
      return '🐟';
    } else if (categoryLower.includes('صيدلية')) {
      return '💊';
    } else if (categoryLower.includes('ملابس')) {
      return '👕';
    } else if (categoryLower.includes('أحذية')) {
      return '👟';
    } else if (categoryLower.includes('إلكترونيات')) {
      return '📱';
    } else if (categoryLower.includes('كتب')) {
      return '📚';
    } else if (categoryLower.includes('ألعاب')) {
      return '🎮';
    } else if (categoryLower.includes('مطعم') || categoryLower.includes('مأكولات')) {
      return '🍽️';
    } else {
      return '🏪';
    }
  };

  return (
    <div className={`text-2xl ${className}`}>
      {getIconForCategory(category)}
    </div>
  );
};

export default DefaultShopIcon;
