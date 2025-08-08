import React, { useState, useRef, useEffect } from "react";

interface TopDownButtonProps {
  label: string;
  options: string[];
  onSelect: (value: string) => void;
  className?: string;
  disabled?: boolean;
  selected?: string;
}

export const TopDownButton: React.FC<TopDownButtonProps> = ({
  label,
  options,
  onSelect,
  className = "",
  disabled = false,
  selected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string>("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected && selected !== internalSelected) {
      setInternalSelected(selected);
    }
  }, [selected]);
  const handleToggle = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (value: string) => {
    setInternalSelected(value);
    onSelect(value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filled = !!selected;

  return (
    <div className="topdown-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`topdown-button ${filled ? "filled" : ""} ${className}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className="topdown-label">{internalSelected || label}</span>
        <span className="topdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <ul className="topdown-menu">
          {options.map((opt, index) => (
            <li
              key={index}
              className={`topdown-option ${
                internalSelected === opt ? "filled" : ""
              }`}
              onClick={() => handleOptionClick(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};