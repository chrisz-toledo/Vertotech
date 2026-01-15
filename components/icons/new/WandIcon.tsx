
import React from 'react';

interface IconProps {
    className?: string;
}

export const WandIcon: React.FC<IconProps> = (props) => (
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
        <path d="M15 4V2" />
        <path d="M15 16v-2" />
        <path d="M8 9h2" />
        <path d="M20 9h2" />
        <path d="M17.8 11.8 19 13" />
        <path d="M15 9a3 3 0 0 0-3-3" />
        <path d="M12 12a3 3 0 0 0-3 3" />
        <path d="M11 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
    </svg>
);
