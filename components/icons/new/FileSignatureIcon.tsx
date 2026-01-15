import React from 'react';

interface IconProps {
    className?: string;
}

export const FileSignatureIcon: React.FC<IconProps> = (props) => (
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
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <path d="M12 18h.01" />
    <path d="M15 12.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 5 0Z" />
    <path d="M17 16.5c.33.8.5 1.83.5 3" />
    <path d="M16 14.5c.83.33 1.83.5 3 .5" />
    <path d="M7 16.5c-.33.8-.5 1.83-.5 3" />
    <path d="M8 14.5c-.83.33-1.83.5-3 .5" />
  </svg>
);