import React from 'react';

interface IconProps {
    className?: string;
}

export const GanttChartIcon: React.FC<IconProps> = (props) => (
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
    <path d="M8 6h10" />
    <path d="M6 12h9" />
    <path d="M11 18h7" />
  </svg>
);