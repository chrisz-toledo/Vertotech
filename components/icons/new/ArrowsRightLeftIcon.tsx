import React from 'react';

interface IconProps {
    className?: string;
}

export const ArrowsRightLeftIcon: React.FC<IconProps> = (props) => (
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
    <path d="m17 13 4-4-4-4"/>
    <path d="M21 9H3"/>
    <path d="m7 11-4 4 4 4"/>
    <path d="M3 15h18"/>
  </svg>
);