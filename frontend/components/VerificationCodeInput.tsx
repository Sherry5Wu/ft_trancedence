import React, { useRef, useState } from 'react';

interface VerificationCodeInputProps {
  onComplete: (code: string) => void;
}

const CODE_LENGTH = 6;

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({ onComplete }) => {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }

    if (newCode.every(char => char !== '')) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        focusInput(index - 1);
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    }

    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  return (
    <div
      className="flex gap-4 justify-center"
      role="group"
      aria-label="Verification code input"
    >
      {Array.from({ length: CODE_LENGTH }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[index]}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          aria-label={`Digit ${index + 1}`}
          className="w-12 h-12 text-center bg-[#FFEE8C] rounded-full text-xl focus:outline-none focus:ring-3 focus:ring-black"
        />
      ))}
    </div>
  );
};

export default VerificationCodeInput;
