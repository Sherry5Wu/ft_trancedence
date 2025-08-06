import React, { useState, useRef, useEffect } from "react";

interface TopDownButtonProps {
  label: string;
  options: string[];
  onSelect: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const TopDownButton: React.FC<TopDownButtonProps> = ({
  label,
  options,
  onSelect,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (value: string) => {
    setSelected(value);
    onSelect(value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filled = !!selected;

  return (
    <div className="topdown-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`topdown-button ${filled ? "filled" : ""} ${className}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className="topdown-label">{selected || label}</span>
        <span className="topdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <ul className="topdown-menu">
          {options.map((opt, index) => (
            <li
              key={index}
              className="topdown-option"
              onClick={() => handleOptionClick(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


// import React, { useState, useRef, useEffect } from "react";

// interface TopDownButtonProps {
//   label: string;
//   options: string[];
//   onSelect: (value: string) => void;
//   className?: string;
//   disabled?: boolean;
// }

// const TopDownButton: React.FC<TopDownButtonProps> = ({
//   label,
//   options,
//   onSelect,
//   className = "",
//   disabled = false,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selected, setSelected] = useState<string>("");
//   const wrapperRef = useRef<HTMLDivElement>(null);

//   const handleToggle = () => {
//     if (!disabled) setIsOpen((prev) => !prev);
//   };

//   const handleOptionClick = (value: string) => {
//     setSelected(value);
//     onSelect(value);
//     setIsOpen(false);
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         wrapperRef.current &&
//         !wrapperRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const filled = !!selected;

//   return (
//     <div className="topdown-wrapper" ref={wrapperRef}>
//       <button
//         type="button"
//         className={`topdown-button ${filled ? "filled" : ""} ${className}`}
//         onClick={handleToggle}
//         disabled={disabled}
//       >
//         <span className="topdown-label">{selected || label}</span>
//         <span className="topdown-arrow">{isOpen ? "▲" : "▼"}</span>
//       </button>

//       {isOpen && (
//         <ul className="topdown-menu">
//           {options.map((opt, index) => (
//             <li
//               key={index}
//               className="topdown-option"
//               onClick={() => handleOptionClick(opt)}
//             >
//               {opt}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default TopDownButton;
