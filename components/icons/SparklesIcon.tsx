import React from 'react';

interface IconProps {
    className?: string;
}

export const SparklesIcon: React.FC<IconProps> = (props) => (
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
    <path d="m12 3-1.5 3-3-1.5 1.5 3-3 1.5h6l1.5 3 1.5-3h6l-3-1.5 1.5-3-3 1.5-1.5-3Z" />
    <path d="M5 8v4" />
    <path d="M19 8v4" />
    <path d="M8 5h4" />
    <path d="M8 19h4" />
    <path d="M19 16.5 16.5 19l-2.5-2.5" />
    <path d="m5 16.5 2.5 2.5 2.5-2.5" />

  </svg>
);