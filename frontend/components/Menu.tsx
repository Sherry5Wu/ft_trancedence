import React, { useState, ReactElement } from 'react';

interface MenuItemProps {
    icon?: ReactElement, 
    label?: string, 
    onClick: () => void
};

const MenuItem = ({ label, icon, onClick }: MenuItemProps) => {
    return (
        <button type='button' onClick={onClick}>
            {icon}
            {label}
        </button>
    );
};

interface MenuProps {
    'aria-label': string,
    icon: ReactElement,
    elements: MenuItemProps[]
}

export const Menu = ({ 'aria-label': ariaLabel, icon, elements}: MenuProps ) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button aria-label={ariaLabel} onClick={() => setIsOpen(!isOpen)}>{icon}</button>
            {isOpen && (
                <div>
                    {elements.map((item, index: number) => <MenuItem key={index} {...item} />)}
                </div>
            )}
        </>
    );
};