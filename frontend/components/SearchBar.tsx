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
    // const [internalSelected, setInternalSelected] = useState<string>("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [filterText, setFilterText] = useState('');

    // useEffect(() => {
    // if (selected && selected !== internalSelected) {
    //     setInternalSelected(selected);
    // }
    // }, [selected]);

    // const handleToggle = () => {
    // if (!disabled) setIsOpen((prev) => !prev);
    // };

    const handleOptionClick = (value: string) => {
        // setInternalSelected(value);
        onSelect(value);
        // setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node))
                setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (value)
            setIsOpen(true);
        else
            setIsOpen(false);
    }, [value])

    // const filled = !!selected;

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
            <ul className="dropdown-menu border-2 z-20 -translate-y-2">
            {options.map((opt, index) => (
                <li
                key={index}
                className={'dropdown-option bg-[#FFEE8C] border-black border-3 z-20 shadow-2xl opacity-100 rounded-2xl'}
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