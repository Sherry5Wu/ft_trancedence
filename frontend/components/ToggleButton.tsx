
export const ToggleButton = ( { isOn }: { isOn?: boolean }) => {
    // console.log('isOn: ' + isOn);
    return (
        <div className={`relative inline-block w-11 h-5 rounded-full transition-all ease-in-out  ${isOn ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div className={`w-5 h-5 rounded-full border border-slate-300 shadow-sm transition-all ease-in-out 
                            ${isOn ? 'bg-white translate-x-6' : ''}`}>
                {/* {isOn ? 'ON' : 'OFF'} */}
            </div>
        </div>
    );
} 