import React from 'react';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import DefaultShopIcon from './DefaultShopIcons';

interface ShopLogoProps {
  logo: string | null | undefined;
  name: string;
  category?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'shop' | 'restaurant' | 'default';
}

const ShopLogo: React.FC<ShopLogoProps> = ({ 
  logo, 
  name, 
  category = '',
  className = '', 
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  const variantClasses = {
    shop: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600',
    restaurant: 'bg-gradient-to-br from-green-100 to-green-200 text-green-600',
    default: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
  };

  const hasValidLogo = logo && logo !== '/placeholder.svg' && logo !== '';

  return (
    <div className={`${sizeClasses[size]} rounded-lg ${variantClasses[variant]} flex items-center justify-center overflow-hidden ${className}`}>
      {hasValidLogo ? (
        <img 
          src={getImageUrl(logo)} 
          alt={`شعار ${name}`}
          onError={(e) => handleImageError(e)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center">
          {category ? (
            <DefaultShopIcon category={category} />
          ) : (
            <div className="font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopLogo;
