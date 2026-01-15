import React from 'react';

interface IconProps {
    className?: string;
}

export const TagIcon: React.FC<IconProps> = (props) => (
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
    <path d="M12.586 2.586a2 2 0 0 0-2.828 0L2.172 10.172a2 2 0 0 0 0 2.828l9.192 9.192a2 2 0 0 0 2.828 0l7.586-7.586a2 2 0 0 0 0-2.828L12.586 2.586z"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
  </svg>
);