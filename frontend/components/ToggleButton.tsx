import { useState } from 'react';

interface ToggleButtonProps {
    label?: string;
    onClick?: () => void;
}

export const ToggleButton = ( { label, onClick }: ToggleButtonProps) => {
    const [isOn, setIsOn] = useState(false);

    const handleClick = () => {
        if (onClick)
            onClick();
        setIsOn(!isOn);
    }

    return (
        <div>
        <button onClick={handleClick} className={`relative inline-block w-13 h-7 rounded-full transition-all ease-in-out  ${isOn ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div className={`w-5 h-5 ml-1 rounded-full border transition-all ease-in-out 
                            ${isOn ? 'bg-white translate-x-6' : 'bg-slate-800'}`}>
                {/* {isOn ? 'ON' : 'OFF'} */}
            </div>
        </button>
        <span className='ml-3'>{label}</span>
        </div>
    );
} 