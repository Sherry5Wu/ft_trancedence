import { useState } from 'react';
import { MenuItemProps } from '../utils/Interfaces';

export const MenuItem = ({ label, Icon, Button, onClick, variant, className }: MenuItemProps) => {

    const [isOn, setIsOn] = useState(false);
    
    const handleClick = () => {
        setIsOn(!isOn);
        if (onClick)
            onClick();
    };

    // if (sort) {
    //     return (
    //         <button type='button' onClick={handleClick} className='flex bg-[#FFEE8C] w-full rounded-full mr-8 border-2 border-transparent 
    //                                                                 hover:border-black active:border-[#4682B4] transition ease-in duration-100'>
    //             {label && <span className='truncate pl-11 active:border-[#4682B4]'>{label}</span>}
    //         </button>
    //     );
    // }

    if (variant === 'userMenu') {
        return (
            <button type='button' onClick={handleClick} className={`${className} flex mt-1 active:text-[#4682B4] active:border-[#4682B4]`}>
                {Icon && <span className=''>{Icon}</span>}
                {label && <span className='truncate w-full pl-2 active:border-[#4682B4]'>{label}</span>}
            </button>
        );
    }

    return (
        <button type='button' onClick={handleClick} className={`${className} flex items-center -my-1.5 ml-7 border-l-3 border-b-3 border-b-transparent 
                                                                hover:border-b-black active:text-[#4682B4] hover:cursor-pointer active:border-[#4682B4]`}>
            {Icon && <span className='size-12 flex-shrink-0 -mr-1 -mt-1'>{Icon}</span>}
            {Button && <span className='ml-2 mt-1'>{Button(isOn)}</span>}
            {label && <span className='truncate w-full ml-3 active:border-[#4682B4]'>{label}</span>}
        </button>
    );
};