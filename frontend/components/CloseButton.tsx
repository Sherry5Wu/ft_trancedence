import React from 'react';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '../assets/noun-close-45886.svg';

export const CloseButton = ({ iconSize = 24, className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`p-1 bg-transparent border-0 cursor-pointer ${className}`}
      aria-label="Go back"
    >
      <img
        src={CloseIcon}
        alt="Go back"
        width={iconSize}
        height={iconSize}
        className="block"
      />
    </button>
  );
};
