// hooks/useValidationField.tsx

import { useState } from 'react';
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

export const useValidationField = (
  initialValue: string,
  validate: (val: string) => boolean
) => {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const handleFilled = (val: string) => {
    const trimmed = val.trim();
    setValue(trimmed);
    if (touched) {
      setError(validate(trimmed) ? '' : 'Invalid format');
    }
  };
  
  const handleBlur = () => {
    setTouched(true);
    const trimmed = value.trim();
    if (trimmed === '') {
      setError('');
      return;
    }
    setError(validate(trimmed) ? '' : 'Invalid format');
  };
  
  return {
    value,
    error,
    onFilled: handleFilled,
    onBlur: handleBlur,
    setValue,
  };
};
