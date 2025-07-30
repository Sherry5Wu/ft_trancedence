// import React, { useState, ChangeEvent } from "react";

// // interface GenericInputProps {
//   type?: string; // Allows types like "text", "email", "password"
//   placeholder: string;
//   onFilled: (value: string) => void;
//   value?: string;
//   required?: boolean;
//   disabled?: boolean;
// }

// export const GenericInput = ({
//   type = "text",
//   placeholder,
//   onFilled,
//   value = "",
//   required = false,
//   disabled = false  
// }: GenericInputProps) => {
//   const [inputValue, setInputValue] = useState(value);

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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
//       disabled={disabled}  
//       className={`generic-input ${inputValue ? "filled" : ""}`}
//     />
//   );
// };



// controlled component
import React, { ChangeEvent } from "react";
import ModifyIcon from "../assets/noun-modify-4084225.svg";

interface GenericInputProps {
  type?: string;
  placeholder: string;
  onFilled: (value: string) => void;
  value: string; // 👈 now required
  required?: boolean;
  disabled?: boolean;
  showEditIcon?: boolean;
}

export const GenericInput = ({
  type = "text",
  placeholder,
  onFilled,
  value,
  required = false,
  disabled = false,
  showEditIcon = false
}: GenericInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onFilled(newValue); // updates parent state
  };

const shouldShowIcon = showEditIcon && value.trim() !== "";

  return (
    <div className="relative w-full">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`generic-input ${value ? "filled" : ""} pr-10`}
      />
      {shouldShowIcon && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
          <img
            src={ModifyIcon}
            alt="Edit"
            className="w-4 h-4"
          />
        </div>
      )}
    </div>
  );
};




// import { useState, useEffect, ChangeEvent } from "react";
// import ModifyIcon from "../assets/noun-modify-4084225.svg"

// interface GenericInputProps {
//   type?: string;
//   placeholder: string;
//   onFilled: (value: string) => void;
//   value?: string;
//   required?: boolean;
//   disabled?: boolean;
//   showEditIcon?: boolean; // NEW PROP
// }

// export const GenericInput = ({
//   type = "text",
//   placeholder,
//   onFilled,
//   value = "",
//   required = false,
//   disabled = false,
//   showEditIcon = false
// }: GenericInputProps) => {
//   const [inputValue, setInputValue] = useState(value);

//   useEffect(() => {
//     setInputValue(value); // Sync when parent updates value
//   }, [value]);

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     setInputValue(newValue);
//     onFilled(newValue);
//   };

//   const shouldShowIcon = showEditIcon && inputValue.trim() !== "";

//   return (
//     <div className="relative w-full">
//       <input
//         type={type}
//         value={inputValue}
//         onChange={handleChange}
//         placeholder={placeholder}
//         required={required}
//         disabled={disabled}
//         className={`generic-input ${inputValue ? "filled" : ""} pr-10`}
//       />
//      {shouldShowIcon && (
//         <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
//           <img
//             src={ModifyIcon}
//             alt="Edit"
//             className="w-4 h-4"
//           />
//         </div>
//       )}
//     </div>
//   );
// };