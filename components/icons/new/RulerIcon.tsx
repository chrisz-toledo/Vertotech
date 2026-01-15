import React from 'react';

interface IconProps {
    className?: string;
}

export const RulerIcon: React.FC<IconProps> = (props) => (
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
    <path d="M21.19 21.19 2.81 2.81" />
    <path d="M2.81 16.51 11 22l5.5-2.5" />
    <path d="m11 11 2.5 5.5.5-3" />
    <path d="m18.5 2.5-3 .5 2 2z" />
    <path d="M16.51 2.81 22 11l-2.5 5.5" />
    <path d="m11 11-5.5-2.5-3 .5" />
    <path d="m2.5 18.5 2-2 .5-3" />
  </svg>
);