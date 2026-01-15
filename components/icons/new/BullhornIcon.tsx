import React from 'react';

interface IconProps {
    className?: string;
}

export const BullhornIcon: React.FC<IconProps> = (props) => (
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
    <path d="M3 11h3a4 4 0 0 1 4 4v1a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-1a4 4 0 0 1 4-4h3"/>
    <path d="M11 11V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6"/>
    <path d="M6 11H4a2 2 0 0 0-2 2v2"/>
    <path d="M18 11h2a2 2 0 0 1 2 2v2"/>
  </svg>
);