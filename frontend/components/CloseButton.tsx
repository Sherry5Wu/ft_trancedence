import React from 'react';
import CloseIcon from '../assets/symbols/noun-cross-rounded-5432729.svg';

// Define the props interface
interface CloseButtonProps {
  iconSize?: number;
  className?: string;
  onClick: () => void; // Ensure onClick is always a function
  ariaLabel?: string; // Optional aria label
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  iconSize = 24,
  className = '',
  onClick,
  ariaLabel = 'Go back',
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-1 bg-transparent border-0 cursor-pointer ${className}`}
      aria-label={ariaLabel}
    >
      <img
        src={CloseIcon}
        alt={ariaLabel}
        width={iconSize}
        height={iconSize}
        className="block"
      />
    </button>
  );
};