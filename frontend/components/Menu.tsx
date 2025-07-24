import React, { useState, ReactElement } from 'react';

interface MenuItemProps {
    Icon?: ReactElement;
    label?: string;
    onClick: () => void;
};

const MenuItem = ({ label, Icon, onClick}: MenuItemProps) => {
    return (
        <div className='relative'>
        <button type='button' onClick={onClick} className='menuItem'>
            {Icon && <div className="menuIcon">{Icon}</div>}
            {label}
        </button>
        </div>
    );
};

interface MenuProps {
    'aria-label': string;
    Icon: ReactElement;
    elements: MenuItemProps[];
}

export const Menu = ({ 'aria-label': ariaLabel, Icon, elements}: MenuProps ) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button aria-label={ariaLabel} onClick={() => setIsOpen(!isOpen)} className='menuIcon'>{Icon}</button>
            {isOpen && (
                <ul aria-label='menu items' className='dropdownMenu'>
                    {elements.map((item, index: number) => (<li key={index}> <MenuItem {...item} /></li>))}
                </ul>
            )}
        </>
    );
};