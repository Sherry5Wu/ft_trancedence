import React from 'react';
import CloseIcon from '../assets/icons/symbols/cross-rounded.svg';
import { CloseButtonProps } from '../utils/Interfaces';

export const CloseButton: React.FC<CloseButtonProps> = ({
  iconSize = 24,
  className = '',
  onClick,
  ariaLabel = 'Go back',
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-1 bg-transparent rounded-full border-2 border-transparent cursor-pointer ${className} hover:bg-white hover:border-[#4682B4]`}
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