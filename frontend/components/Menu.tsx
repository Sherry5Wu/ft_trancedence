import React, { useState, ReactElement } from 'react';

interface MenuItemProps {
    Icon?: ReactElement;
    label?: string;
    onClick: () => void;
};

const MenuItem = ({ label, Icon, onClick }: MenuItemProps) => {
    return (
        <button type='button' onClick={onClick}>
            {Icon}
            {label}
        </button>
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
            <button aria-label={ariaLabel} onClick={() => setIsOpen(!isOpen)}>{Icon}</button>
            {isOpen && (
                <div>
                    {elements.map((item, index: number) => <MenuItem key={index} {...item} />)}
                </div>
            )}
        </>
    );
};