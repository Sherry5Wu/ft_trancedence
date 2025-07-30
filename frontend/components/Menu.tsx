import { useState, useRef, ReactElement } from 'react';
import { MenuItem, MenuItemProps } from './MenuItem'
import { useClickOutside } from './Hooks';

interface MenuProps {
    'aria-label': string;
    Icon: ReactElement;
    elements?: MenuItemProps[];
    className: string;
    onClick?: () => void;
    user?: boolean;
};

export const Menu = ({ 'aria-label': ariaLabel, Icon, elements, className, onClick, user}: MenuProps ) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsOpen(false));

    const handleClick = () => {
        // console.log('isOpen is ' + isOpen);
        if (onClick)
            onClick();
        if (user && isOpen === true)
            setIsOpen(false);
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
                    {elements && elements.map((item, index: number) => (<li key={index}> <MenuItem {...item} user={user} /></li>))}
                </ul>
            )}
        </nav>
    );
};