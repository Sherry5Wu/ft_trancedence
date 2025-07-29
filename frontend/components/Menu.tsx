import { useState, useRef, ReactElement } from 'react';
import { MenuItem, UserMenuItem, MenuItemProps } from './MenuItem'
import { useClickOutside } from './Hooks';

interface MenuProps {
    'aria-label': string;
    Icon: ReactElement;
    elements?: MenuItemProps[];
    className: string;
    onClick?: () => void;
};

export const Menu = ({ 'aria-label': ariaLabel, Icon, elements, className, onClick}: MenuProps ) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsOpen(false));

    const handleClick = () => {
        if (onClick)
            onClick();
        else
            setIsOpen(!isOpen);
    }

    return (
        <nav className='relative inline-block' ref={menuRef}>
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

export const UserMenu = ({ 'aria-label': ariaLabel, Icon, elements, className, onClick}: MenuProps ) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsOpen(false));

    const handleClick = () => {
        if (onClick)
            onClick();
        else
            setIsOpen(!isOpen);
    }

    return (
        <nav className='relative inline-block' ref={menuRef}>
            <button aria-label={ariaLabel} onClick={handleClick} className={className}>{Icon}</button>
            {isOpen && (
                <ul aria-label='menu items' className='absolute top-full left-0'>
                    {elements && elements.map((item, index: number) => (<li key={index}> <UserMenuItem {...item} /></li>))}
                </ul>
            )}
        </nav>
    );
};