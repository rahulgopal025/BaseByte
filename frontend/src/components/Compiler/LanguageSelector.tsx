import React from "react";
import { ChevronDown, Code2 } from "lucide-react";

interface Props {
  language: string;
  setLanguage: (lang: string) => void;
  onLanguageChange: (lang: string) => void;
}

const LanguageSelector: React.FC<Props> = ({ language, setLanguage, onLanguageChange }) => {
  // Mapping language values to display names for better UI
  const displayNames: { [key: string]: string } = {
    c: "C Language",
    python: "Python 3",
    java: "Java (Main)"
  };

  return (
    <div className="relative group">
      {/* Icon and Label Decoration */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none group-hover:text-indigo-400 transition-colors">
        <Code2 size={14} />
      </div>

      <select 
        value={language} 
        onChange={(e) => {
          setLanguage(e.target.value);
          onLanguageChange(e.target.value);
        }}
        className="appearance-none bg-[#1a1a1e] text-[11px] font-bold text-gray-300 pl-8 pr-6 py-2 rounded-xl border border-white/5 outline-none cursor-pointer hover:border-indigo-500/50 hover:bg-[#1f1f23] transition-all shadow-inner tracking-widest uppercase"
      >
        <option value="c">C </option>
        <option value="python">Python</option>
        <option value="java">Java</option>
      </select>

      {/* Custom Dropdown Arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-indigo-400 transition-colors">
        <ChevronDown size={14} />
      </div>
    </div>
  );
};

export default LanguageSelector;