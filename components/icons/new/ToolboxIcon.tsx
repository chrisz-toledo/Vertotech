import React from 'react';

interface IconProps {
    className?: string;
}

export const ToolboxIcon: React.FC<IconProps> = (props) => (
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
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    <path d="M12 5.67a2.5 2.5 0 0 1 3.54 0L18 8l-6 6-2.5-2.5-1.5-1.5" />
    <path d="M2 14l6 6" />
    <path d="M16 4h2a2 2 0 0 1 2 2v2" />
    <path d="M8 22H6a2 2 0 0 1-2-2v-2" />
  </svg>
);
// Simplified representation of a toolbox
export const ToolboxIconSimple: React.FC<IconProps> = (props) => (
    <svg  {...props}  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round" >
        <path d="M2 6s.5-1 2-1h16c1.5 0 2 1 2 1v2s-.5 1-2 1H4c-1.5 0-2-1-2-1V6Z"/>
        <path d="M8 6V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v1"/>
        <path d="M2 10v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8"/>
    </svg>
);