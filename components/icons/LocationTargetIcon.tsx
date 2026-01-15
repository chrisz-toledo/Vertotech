import React from 'react';

interface IconProps {
    className?: string;
}

export const LocationTargetIcon: React.FC<IconProps> = (props) => (
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
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M22 12h-2" />
    <path d="M4 12H2" />
    <path d="M19.07 4.93l-1.41 1.41" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M19.07 19.07l-1.41-1.41" />
    <path d="M4.93 4.93l1.41 1.41" />
  </svg>
);
