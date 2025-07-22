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

export const Menu = ({ items }: { items: MenuItemProps[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)}></button>
            {isOpen && (
                <div>
                    {items.map((item, index: number) => (
                        <MenuItem
                            key={index}
                            label={item.label}
                            icon={item.icon}
                            onClick={item.onClick} />))}
                </div>
            )}
        </>
    );
};