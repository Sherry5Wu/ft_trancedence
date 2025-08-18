// components/GenericInput.tsx
// controlled component

import React, { useState, ChangeEvent, useRef } from "react";
// import ModifyIcon from "../assets/noun-modify-4084225.svg?react";
import ModifyIcon from "../assets/square-pen.svg?react";
import { useTranslation } from 'react-i18next';
import Eye from "../assets/eye.svg?react";
import EyeOff from "../assets/eye-closed.svg?react";

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
  allowVisibility?: boolean;
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
  allowVisibility = false,
}: GenericInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilled(e.target.value);
  };

  const handleEditClick = () => {
    inputRef.current?.focus();
  };

  const { t } = useTranslation();
  const inputId = placeholder.toLowerCase().replace(/\s+/g, '-');
  const shouldShowIcon = showEditIcon && value.trim() !== "";
  const effectiveType =
    allowVisibility && type === "password"
      ? isVisible
        ? "text"
        : "password"
      : type;

  return (
    <div className="flex flex-col">
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type={effectiveType}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          className={`${className ? className : 'generic-input'} ${value ? "filled" : ""} pr-10`}
          onBlur={onBlur}
        />

        {shouldShowIcon && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:cursor-pointer"
            aria-label={t('components.genericInput.aria.modify') ?? 'Edit'}
            onClick={handleEditClick}
          >
            <ModifyIcon className="w-4 h-4" />
          </button>
        )}

        {allowVisibility && type === "password" && (
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            aria-label={isVisible ? t('components.genericInput.aria.hidePass') : t('components.genericInput.aria.showPass')}
          >
            {isVisible ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {errorMessage && (
        <p
          id={`${inputId}-error`}
          className="text-black text-xs mt-1 whitespace-pre-line pl-4"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};