
import React from 'react';

interface IconProps {
    className?: string;
}

export const BrainCircuitIcon: React.FC<IconProps> = (props) => (
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
    <path d="M12 5a3 3 0 1 0-5.993.142" />
    <path d="M18 5a3 3 0 1 0-5.993.142" />
    <path d="M12 12a3 3 0 1 0-5.993.142" />
    <path d="M18 12a3 3 0 1 0-5.993.142" />
    <path d="M12 19a3 3 0 1 0-5.993.142" />
    <path d="M18 19a3 3 0 1 0-5.993.142" />
    <path d="M12 5v0a3 3 0 0 0-3 3v0" />
    <path d="M12 12v0a3 3 0 0 0-3 3v0" />
    <path d="M12 5a3 3 0 0 1 3 3" />
    <path d="M12 12a3 3 0 0 1 3 3" />
    <path d="M6 5h0a3 3 0 0 1 3 3" />
    <path d="M6 12h0a3 3 0 0 1 3 3" />
    <path d="m15.34 6.66-.01 0" />
    <path d="m15.33 13.66-.01 0" />
    <path d="m8.67 6.67-.01 0" />
    <path d="m8.66 13.67-.01 0" />
    <path d="M9 12a3 3 0 0 0-3-3" />
    <path d="M15 12a3 3 0 0 0-3-3" />
  </svg>
);
