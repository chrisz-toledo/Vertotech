import React from 'react';

interface IconProps {
    className?: string;
}

export const IdCardIcon: React.FC<IconProps> = (props) => (
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
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="M6 10h2" />
        <path d="M12 10h6" />
        <path d="M12 14h6" />
        <path d="M6 14h2" />
    </svg>
);