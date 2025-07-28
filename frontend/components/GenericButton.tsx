import React from "react";

interface GenericButtonProps {
  text?: string;
  icon?: React.ReactNode;
  className?: string;
  hoverLabel?: string;
  disabled?: boolean;
  onClick: () => void;
}

export const GenericButton: React.FC<GenericButtonProps> = ({
  text,
  icon,
  className = "",
  hoverLabel,
  onClick,
  disabled = false
}) => {
  return (
    <div className="button-wrapper">
      <button
        type="button"
        className={`${className} ${disabled ? 'disabled-button' : ''}`}
        onClick={onClick}
        disabled={disabled}
      >
        {icon && <span className="icon-wrapper">{icon}</span>}
        {text && <span className="text-wrapper">{text}</span>}
      </button>
      {hoverLabel && <span className="hover-label">{hoverLabel}</span>}
    </div>
  );
};