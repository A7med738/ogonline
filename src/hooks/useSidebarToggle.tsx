import { useState, useEffect } from 'react';

export const useSidebarToggle = () => {
  const [isVisible, setIsVisible] = useState(() => {
    const stored = localStorage.getItem('sidebar-visible');
    return stored !== null ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    localStorage.setItem('sidebar-visible', JSON.stringify(isVisible));
  }, [isVisible]);

  const toggle = () => setIsVisible(prev => !prev);

  return { isVisible, toggle };
};