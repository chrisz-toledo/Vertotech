import React from 'react';

interface IconProps {
    className?: string;
}

export const BlueprintIcon: React.FC<IconProps> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 21v-3.23" />
    <path d="M6 16.65v-3.3" />
    <path d="M18 16.65v-3.3" />
    <path d="M12 8V2" />
    <path d="M9 5.09a7.14 7.14 0 0 1 6 0" />
    <path d="M3.24 12.5a7.14 7.14 0 0 0 0 6.99" />
    <path d="M20.76 12.5a7.14 7.14 0 0 1 0 6.99" />
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    <path d="M12 12a2.83 2.83 0 0 0-2 5" />
    <path d="M14 17a2.83 2.83 0 0 0 2-5" />
    <path d="M12 12a2.83 2.83 0 0 1 2-5" />
    <path d="M10 7a2.83 2.83 0 0 1-2 5" />
  </svg>
);