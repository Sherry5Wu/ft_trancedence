import { ChangeEvent, useState, useEffect, useRef } from "react";
import { useClickOutside } from "../utils/Hooks";
import { SearchBarInputProps } from "../utils/Interfaces";
import { FetchedUserData } from "../utils/Interfaces";
import { fetchUsers } from '../utils/Fetch';
import { useUserContext } from "../context/UserContext";

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
    // const [rivalData, setRivalData] = useState<string[]>([]);
    // const accessToken = useUserContext().user?.accessToken;

    // useEffect(() => {
    //     const fetchOtherUsers = async (accessToken) => {
    //         const data = await fetchUsers(accessToken);
    //         setRivalData(data);
    //     };
    //     fetchOtherUsers(accessToken);
    // }, [])

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
                    {options
                        .filter((option) => option.username && option.username.toLowerCase().includes(value.toLowerCase())).length > 0 ?
                        
                        options
                        .filter((option) => option != null)
                        .filter((option) => option.username.toLowerCase().includes(value.toLowerCase()))
                        .map((option, index) => (
                            <li
                                key={index}
                                className={'dropdown-option !py-1'}
                                onClick={() => handleOptionClick(option.username)}
                            >
                            {option.avatarUrl ? <img src={option.avatarUrl} className="profilePicMini" /> : <img src='../assets/noun-profile-7808629.svg' className="profilePicMini" />}
                            {option.username}
                            </li>
                        ))
                        :
                        <li className='flex justify-center text-[#CD1C18] font-semibold'>No users found</li>}
                </ul>
            )}
        </div>
    );
};