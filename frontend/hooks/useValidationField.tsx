// hooks/useValidationField.tsx

import { useState } from 'react';

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
