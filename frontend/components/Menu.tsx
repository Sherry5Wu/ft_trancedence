import { useState, useRef } from 'react';
import { MenuItem } from './MenuItem'
import { MenuProps } from '../utils/Interfaces';
import { useClickOutside } from '../utils/Hooks';

export const Menu = ({ 'aria-label': ariaLabel, Icon, elements, className, onClick, variant}: MenuProps ) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsOpen(false));

    const handleClick = () => {
        // console.log('isOpen is ' + isOpen);
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
                    {elements && elements.map((item, index: number) => (
                        <li key={index} className=''> <MenuItem {...item} variant={variant} /></li>))}
                </ul>
            )}
        </nav>
    );
};