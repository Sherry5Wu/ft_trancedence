    import { RefObject, useEffect } from 'react';
    
    export const useClickOutside = (ref: RefObject<HTMLElement | null>, onOutsideClick: () => void) => {
        useEffect(() => {
            const handleClick = (event: MouseEvent) => {
                if (ref.current && !ref.current.contains(event.target as Node))
                    onOutsideClick();
            };

            document.addEventListener("mousedown", handleClick);
            return () => document.removeEventListener("mousedown", handleClick);
        }, [ref, onOutsideClick]);
    }