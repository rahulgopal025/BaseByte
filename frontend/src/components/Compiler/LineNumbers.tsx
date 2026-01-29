import React from "react";

interface Props {
  lines: number;
  fontSize: number;
  errorLine: number | null; 
}

const LineNumbers: React.FC<Props> = ({ lines, fontSize, errorLine }) => {
  return (
    <div 
      className="w-10 md:w-12 bg-[#050505] py-5 flex flex-col items-center text-gray-300 font-mono select-none border-r border-white/5 overflow-hidden"
      style={{ fontSize: `${fontSize - 2}px` }}
    >
      {Array.from({ length: lines }).map((_, i) => {
        const isErrorLine = errorLine === i + 1; 
        return (
          <div 
            key={i} 
            className={`leading-relaxed w-full text-center transition-colors ${
              isErrorLine ? "bg-red-500/20 text-red-500 font-bold border-r-2 border-red-500" : "opacity-50"
            }`}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );
};

export default LineNumbers;