import React, { useState } from "react";

interface GenericInputProps {
  type?: string; // Allows types like "text", "email", "password"
  placeholder: string;
  onFilled: (value: string) => void;
  value?: string;
  required?: boolean;
}

export const GenericInput: React.FC<GenericInputProps> = ({
  type = "text",
  placeholder,
  onFilled,
  value = "",
  required = false
}) => {
  const [inputValue, setInputValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onFilled(newValue);
  };

  return (
    <input
      type={type}
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      className={`generic-input ${inputValue ? "filled" : ""}`}
    />
  );
};

// import React, { useState } from "react";

// interface GenericInputProps {
//   type?: string; // <- This allows type like "text", "email", "password"
//   placeholder: string;
//   onFilled: (value: string) => void;
//   value?: string;
//   required?: boolean;
// }

// const GenericInput: React.FC<GenericInputProps> = ({
//   type = "text",
//   placeholder,
//   onFilled,
//   value = "",
//   required = false
// }) => {
//   const [inputValue, setInputValue] = useState(value);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     setInputValue(newValue);
//     onFilled(newValue);
//   };

//   return (
//     <input
//       type={type}
//       value={inputValue}
//       onChange={handleChange}
//       placeholder={placeholder}
//       required={required}
//       className={`generic-input ${inputValue ? "filled" : ""}`}
//     />
//   );
// };

// export default GenericInput;
