import React, { useState, ReactElement } from 'react';

interface MenuItemProps {
    Icon?: ReactElement;
    label?: string;
    button?: ReactElement;
    onClick: () => void;
};

const MenuItem = ({ label, Icon, onClick}: MenuItemProps) => {
    return (
        <button type='button' onClick={onClick} className='flex items-center'>
            {Icon && <span className='menuIcon scale-70'>{Icon}</span>}
            {label && <span className='truncate w-full pl-7'>{label}</span>}
        </button>
    );
};

interface MenuProps {
    'aria-label': string;
    Icon: ReactElement;
    elements: MenuItemProps[];
    className: string;
}

export const Menu = ({ 'aria-label': ariaLabel, Icon, elements, className}: MenuProps ) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className='relative inline-block'>
            <button aria-label={ariaLabel} onClick={() => setIsOpen(!isOpen)} className={className}>{Icon}</button>
            {isOpen && (
                <ul aria-label='menu items' className='absolute top-full'>
                    {/* absolute inset-0 mt-3 w-50 */}
                    {/* absolute top-full left-5 w-50 */}
                    {elements.map((item, index: number) => (<li key={index}> <MenuItem {...item} /></li>))}
                </ul>
            )}
        </div>
    );
};