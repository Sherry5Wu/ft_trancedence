// hooks/useValidationField.tsx

import { useState } from 'react';
import { RefObject, useEffect } from 'react';
import { useUserContext } from '../context/UserContext';

export const useRequestNewToken = () => {
	const { user, refresh } = useUserContext();

	return async () => {
		if (!user)
			return null;

		if (Date.now() > user.expiry)
		{
			const newToken = await refresh();
			return newToken;
		}
		return (user?.accessToken);
	}
}

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
  validate: (val: string) => boolean,
  invalidMsg: string
) => {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const handleFilled = (val: string) => {
    const trimmed = val.trim();
    setValue(trimmed);
    if (touched) {
      setError(validate(trimmed) ? '' : invalidMsg);
    }
  };
  
  const handleBlur = () => {
    setTouched(true);
    const trimmed = value.trim();
    if (trimmed === '') {
      setError('');
      return;
    }
    setError(validate(trimmed) ? '' : invalidMsg);
  };
  
  return {
    value,
    error,
    onFilled: handleFilled,
    onBlur: handleBlur,
    setValue,
  };
};
