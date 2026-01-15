import React from 'react';

interface IconProps {
    className?: string;
}

export const GavelIcon: React.FC<IconProps> = (props) => (
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
    <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/>
    <path d="m15 5 3 3"/>
    <path d="m22 2-3 1-1.07 1.071a2.123 2.123 0 0 1-3 3L14 8l-3 3 1 1 3 3 1-1 1-1Z"/>
  </svg>
);