import React from "react";
import InfoIcon from "../assets/symbols/noun-alert-rounded-5432721.svg?react"

type TooltipProps = {
  text: string;
};

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="flex items-center group ">

      <InfoIcon className="w-6 h-6 cursor-pointer" />

      <div
        className={`
          absolute left-full ml-2
          hidden group-hover:block
          bg-[#FFEE8C] text-black text-xs px-3 py-2 
          rounded-2xl shadow-lg z-10
          w-60 break-words
        `}
      >
        {text}
      </div>
    </div>
  );
};
