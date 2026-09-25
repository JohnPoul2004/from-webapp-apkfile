import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Solo Parent Icon
 * Features a single parent figure with a child / heart motif
 * Representing 4xx Client Errors
 */
export const SoloParentIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Solo Parent"
    >
      {/* Parent Head */}
      <circle cx="9" cy="6" r="3" />
      {/* Parent Body */}
      <path d="M3 19v-2a5 5 0 0 1 10 0v2" />
      {/* Child Head */}
      <circle cx="17.5" cy="11.5" r="2.2" />
      {/* Child Body holding onto Parent */}
      <path d="M14 20v-1.5a3.5 3.5 0 0 1 7 0V20" />
      {/* Heart / bond indicator */}
      <path
        d="M13.8 6.2c.4-.6 1.2-.6 1.6 0 .4.6 0 1.2-.8 1.8-.8-.6-1.2-1.2-.8-1.8z"
        fill="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  );
};

/**
 * Parents Icon
 * Features two parent figures together with family bond
 * Representing 5xx Server Errors
 */
export const ParentsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Parents"
    >
      {/* Parent 1 Head */}
      <circle cx="7" cy="6" r="2.8" />
      {/* Parent 2 Head */}
      <circle cx="17" cy="6" r="2.8" />
      {/* Parent 1 Body */}
      <path d="M2 19v-2a4.5 4.5 0 0 1 7.5-3.3" />
      {/* Parent 2 Body */}
      <path d="M22 19v-2a4.5 4.5 0 0 0-7.5-3.3" />
      {/* Child Head in center */}
      <circle cx="12" cy="12" r="2" />
      {/* Child Body & Parents united */}
      <path d="M9.5 20v-1.8a2.5 2.5 0 0 1 5 0V20" />
      {/* Protective bridge uniting parents */}
      <path d="M6 19h12" />
    </svg>
  );
};
