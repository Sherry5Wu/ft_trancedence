import React from "react";
import InfoIcon from "../assets/icons/symbols/alert-rounded.svg?react"

type TooltipProps = {
  text: string;
};

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="flex items-center group ">

      <InfoIcon className="size-4 -translate-y-2 cursor-pointer" />

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
