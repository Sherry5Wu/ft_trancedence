// import React from "react";
// import InfoIcon from "../assets/symbols/noun-alert-rounded-5432721.svg?react"

// export const Tooltip = ({ text, position = "left-full ml-2" }) => {
//   return (
//     <div className="relative flex items-center group">

//       <InfoIcon className="w-6 h-6 cursor-pointer" />

//       <div
//         className={`
//           absolute ${position} 
//           hidden group-hover:block
//           bg-[#FFEE8C] text-black text-sm px-3 py-2 
//           rounded-lg shadow-lg z-10
//           max-w-lg break-words
//         `}
//       >
//         {text}
//       </div>
//     </div>
//   );
// };

import React from "react";
import InfoIcon from "../assets/symbols/noun-alert-rounded-5432721.svg?react";

type TooltipProps = {
  text: string;
};

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {

  return (
    <div className="relative flex items-center group">
      <InfoIcon className="w-6 h-6 cursor-pointer" />

      <div
        className={`
          absolute left-6 top-0 ml-2
          hidden group-hover:block
          bg-[#FFEE8C] text-black text-sm px-3 py-2 
          rounded-lg shadow-lg z-10
          max-w-lg break-words
        `}
      >
        {text}
      </div>
    </div>
  );
};
