import React, { ChangeEvent, useState, useEffect, useRef } from "react";

interface SearchBarInputProps {
    type?: string;
    placeholder: string;
    onFilled: (value: string) => void;
    onSelect: (value: string) => void;
    value: string;
    className?: string;
    options: string[];
    selected?: string;
    disabled?: boolean;
    isOpen: boolean;
}

export const SearchBar = ({
    type = "text",
    placeholder,
    onFilled,
    onSelect,
    options,
    selected,
    disabled,
    value,
    className = '',
}: SearchBarInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilled(e.target.value);
  };
  
    const [isOpen, setIsOpen] = useState(false);
    const [internalSelected, setInternalSelected] = useState<string>("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    if (selected && selected !== internalSelected) {
        setInternalSelected(selected);
    }
    }, [selected]);


    // const handleToggle = () => {
    // if (!disabled) setIsOpen((prev) => !prev);
    // };

    const handleOptionClick = (value: string) => {
    setInternalSelected(value);
    onSelect(value);
    setIsOpen(false);
    };

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node))
            setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
    }, []);

    const filled = !!selected;

    return (
        <div className="relative w-full max-w-md mx-auto">
        <input
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={`${className} ${value ? "text-black" : ""}`}
        />
        {isOpen && (
            <ul className="dropdown-menu">
            {options.map((opt, index) => (
                <li
                key={index}
                className={`dropdown-option ${
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