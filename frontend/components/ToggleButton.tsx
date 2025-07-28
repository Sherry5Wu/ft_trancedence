import { useState } from 'react';

interface ToggleButtonProps {
    label?: string;
}

export const ToggleButton = ( { label }: ToggleButtonProps) => {
    const [isOn, setIsOn] = useState(false);

    return (
        <div>
        <button onClick={() => setIsOn(!isOn)} className={`relative inline-block w-13 h-7 rounded-full transition-all ease-in-out  ${isOn ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div className={`w-5 h-5 ml-1 rounded-full border border-slate-300 shadow-sm transition-all ease-in-out 
                            ${isOn ? 'bg-white translate-x-5' : 'bg-slate-800'}`}>
                {/* {isOn ? 'ON' : 'OFF'} */}
            </div>
        </button>
        <span className='ml-3'>{label}</span>
        </div>
    );
} 