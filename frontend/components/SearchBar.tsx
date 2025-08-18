import React, { ChangeEvent, useState, useEffect, useRef } from "react";
import { useClickOutside } from "../utils/Hooks";
import { SearchBarInputProps } from "../utils/Interfaces";

export const SearchBar = ({
    type = "text",
    placeholder,
    value,
    options,
    onFilled,
    onSelect,
    className = '',
}: SearchBarInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilled(e.target.value);
  };
  
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const handleOptionClick = (value: string) => {
        onSelect(value);
    };

    useClickOutside(ref, () => {setIsOpen(false), onFilled('')});

    useEffect(() => {
        if (value)
            setIsOpen(true);
        else
            setIsOpen(false);
    }, [value])

    return (
        <div ref={ref} className="relative w-full max-w-md mx-auto">
            <input
                type={type}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={`${className} ${value ? "text-black" : ""}`}
            />
            {isOpen && (
                <ul className="dropdown-menu !bg-[#FFEE8C] border-2 -translate-y-2">
                {options.filter((option) => option.toLowerCase().includes(value.toLowerCase())).length > 0 ?
                    options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
                    .map((option, index) => (
                        <li
                            key={index}
                            className={'dropdown-option'}
                            onClick={() => handleOptionClick(option)}
                        >
                        {option}
                        </li>
                    ))
                    :
                    <li className='flex justify-center text-[#CD1C18] font-semibold'>No users found</li>
                }</ul>
            )}
        </div>
    );
};