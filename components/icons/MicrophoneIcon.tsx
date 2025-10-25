import React from 'react';

interface IconProps {
  className?: string;
}

const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || "h-6 w-6"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 10v1a7 7 0 01-14 0v-1"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 19v3m0 0l-4-4m4 4l4-4"
    />
  </svg>
);

export default MicrophoneIcon;