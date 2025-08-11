// components/GenericInput.tsx
// controlled component

import React, { ChangeEvent } from "react";
import ModifyIcon from "../assets/noun-modify-4084225.svg";

interface GenericInputProps {
  type?: string;
  placeholder: string;
  onFilled: (value: string) => void;
  value: string;
  required?: boolean;
  disabled?: boolean;
  showEditIcon?: boolean;
  errorMessage?: string;
  onBlur?: () => void;
  className?: string;
}

export const GenericInput = ({
  type = "text",
  placeholder,
  onFilled,
  value,
  required = false,
  disabled = false,
  showEditIcon = false,
  errorMessage = '',
  onBlur,
  className = '',
}: GenericInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilled(e.target.value);
  };

  const inputId = placeholder.toLowerCase().replace(/\s+/g, '-');
  const shouldShowIcon = showEditIcon && value.trim() !== "";

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={!!errorMessage}
        aria-describedby={errorMessage ? `${inputId}-error` : undefined}
        className={`${className ? className : 'generic input pr-10'} ${value ? "filled" : ""}`}
        onBlur={onBlur}
      />
      {shouldShowIcon && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
          <img src={ModifyIcon} alt="Edit" className="w-4 h-4" />
        </div>
      )}
      {errorMessage && (
        <p
          id={`${inputId}-error`}
          className="text-red-500 text-xs mt-1"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};