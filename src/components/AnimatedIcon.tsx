import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedIconProps {
  className?: string;
  size?: number;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
  className = '', 
  size = 24 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Create a simple pulsing animation
    const svg = svgRef.current;
    if (svg) {
      const animate = () => {
        svg.style.transform = 'scale(1.1)';
        setTimeout(() => {
          svg.style.transform = 'scale(1)';
        }, 500);
        setTimeout(animate, 2000);
      };
      animate();
    }
  }, []);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: 0.5 
      }}
      className={`inline-block ${className}`}
    >
      <motion.svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-500 ease-in-out"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Green house icon with gradient */}
        <defs>
          <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        
        {/* House base */}
        <motion.rect
          x="4"
          y="12"
          width="16"
          height="8"
          rx="1"
          fill="url(#houseGradient)"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        />
        
        {/* Roof */}
        <motion.polygon
          points="2,12 12,4 22,12"
          fill="url(#roofGradient)"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        />
        
        {/* Door */}
        <motion.rect
          x="9"
          y="15"
          width="6"
          height="5"
          rx="0.5"
          fill="#065F46"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        />
        
        {/* Windows */}
        <motion.rect
          x="6"
          y="13"
          width="2"
          height="2"
          rx="0.5"
          fill="#A7F3D0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        />
        <motion.rect
          x="16"
          y="13"
          width="2"
          height="2"
          rx="0.5"
          fill="#A7F3D0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        />
        
        {/* Activity indicator - pulsing dot */}
        <motion.circle
          cx="12"
          cy="6"
          r="2"
          fill="#FEF3C7"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Sparkle effects */}
        <motion.circle
          cx="8"
          cy="8"
          r="1"
          fill="#FDE68A"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
            ease: "easeInOut"
          }}
        />
        <motion.circle
          cx="16"
          cy="8"
          r="1"
          fill="#FDE68A"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
            ease: "easeInOut"
          }}
        />
      </motion.svg>
    </motion.div>
  );
};

export default AnimatedIcon;
