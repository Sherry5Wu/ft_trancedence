import { useState } from "react";

export const ToggleButton = ( {value = false}: { value?: boolean }) => {
    const [isOn, setIsOn] = useState(value);

    return (
        <button onClick={ () => setIsOn(!isOn)} className={isOn ? 'toggleOn' : 'toggleOff'}>
            {isOn ? 'ON' : 'OFF'}
        </button>
    );
}