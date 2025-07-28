import React, { useState, ReactElement } from 'react';

interface MenuItemProps {
    Icon?: ReactElement;
    label?: string;
    Button?: ReactElement;
    href?: string;
    onClick?: () => void;
};

const MenuItem = ({ label, Icon, Button, onClick, href }: MenuItemProps) => {

    if (href) {
        return (
            <a href={href}>
                {Icon && <span className=''>{Icon}</span>}
                {label && <span className='truncate w-full ml-5 pl-3 border-l-3 hover:border-b-3 active:text-[#4682B4]'>{label}</span>}
            </a>
        );
    }

    else {
        return (
            <button type='button' onClick={onClick} className='flex'>
                {Icon && <span className=''>{Icon}</span>}
                {label && <span className='truncate w-full ml-5 pl-3 border-l-3 hover:border-b-3 active:text-[#4682B4]'>{label}</span>}
                {Button} 
                {/* BUTTON DOESN'T RENDER, BUTTON INSIDE BUTTON*/}
            </button>
        );
    }
};

interface MenuProps {
    'aria-label': string;
    Icon: ReactElement;
    elements?: MenuItemProps[];
    className: string;
    onClick?: () => void;
};

export const Menu = ({ 'aria-label': ariaLabel, Icon, elements, className, onClick}: MenuProps ) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        if (onClick)
            onClick();
        else
            setIsOpen(!isOpen);
    }

    return (
        <nav className='relative inline-block'>
            <button aria-label={ariaLabel} onClick={handleClick} className={className}>{Icon}</button>
            {isOpen && (
                <ul aria-label='menu items' className='absolute top-full left-0'>
                    {/* absolute inset-0 mt-3 w-50 */}
                    {/* absolute top-full left-5 w-50 */}
                    {elements && elements.map((item, index: number) => (<li key={index}> <MenuItem {...item} /></li>))}
                </ul>
            )}
        </nav>
    );
};