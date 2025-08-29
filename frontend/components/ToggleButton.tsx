import { useState, useEffect } from 'react';
import { useAccessibilityContext } from '../context/AccessibilityContext';


interface ToggleButtonProps {
    labelOn?: string;
    labelOff?: string;
    checked?: boolean;
    // label?: string;
    className?: string;
    disabled?: boolean
    onClick?: () => void;
}

// export const ToggleButton = ( { label, onClick, className, disabled = false}: ToggleButtonProps) => {
    export const ToggleButton = ({
    labelOn = 'On',
    labelOff = 'Off',
    onClick,
    className,
    disabled = false,
    checked = false,
    }: ToggleButtonProps) => {
    const [isOn, setIsOn] = useState(checked);

    useEffect(() => {
        setIsOn(checked);
    }, [checked]);

    // const handleClick = () => {
    //     if (onClick)
    //         onClick();
    //     setIsOn(!isOn);
    // }

    return (
        <div className={`${className} flex items-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* <button onClick={handleClick}  */}
            <button onClick={onClick}
            className={`relative inline-block w-13 h-7 rounded-full transition-all ease-in-out 
            ${isOn ? 'bg-slate-800' : 'bg-slate-100'}`}
            disabled={disabled}>
                <div className={`w-5 h-5 ml-1 rounded-full border transition-all ease-in-out 
                                ${isOn ? 'bg-white translate-x-6' : 'bg-slate-800'}`}>
                    {/* {isOn ? 'ON' : 'OFF'} */}
                </div>
            </button>
            {/* <span className='ml-3'>{label}</span> */}
            <span className="ml-3">{isOn ? labelOn : labelOff}</span>            
        </div>
    );
} 