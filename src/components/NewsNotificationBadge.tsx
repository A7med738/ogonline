import React from 'react';

interface NewsNotificationBadgeProps {
  count: number;
  className?: string;
}

export const NewsNotificationBadge: React.FC<NewsNotificationBadgeProps> = ({ 
  count, 
  className = "" 
}) => {
  if (count === 0) return null;

  return (
    <div className={`absolute -top-2 -right-2 ${className}`}>
      <div className="bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-semibold px-1.5 animate-pulse shadow-lg">
        {count > 99 ? '99+' : count}
      </div>
    </div>
  );
};