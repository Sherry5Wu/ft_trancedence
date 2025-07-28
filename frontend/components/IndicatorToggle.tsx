
export const Toggle = ( { isOn }: { isOn?: boolean }) => {
    // console.log('isOn: ' + isOn);
    return (
        <div className={`relative inline-block w-11 h-5 rounded-full transition-all ease-in-out  ${isOn ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <div className={`w-5 h-5 rounded-full border transition-all ease-in-out 
                            ${isOn ? 'bg-white translate-x-6' : 'bg-slate-800'}`}>
                {/* {isOn ? 'ON' : 'OFF'} */}
            </div>
        </div>
    );
} 