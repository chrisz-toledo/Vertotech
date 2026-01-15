import React from 'react';

interface IconProps {
    className?: string;
}

export const DatabaseIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5v14a9 3 0 0 0 9 3 9 3 0 0 0 9-3V5"/>
        <path d="M3 12a9 3 0 0 0 9 3 9 3 0 0 0 9-3"/>
    </svg>
);