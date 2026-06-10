import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ icon, className = "", ...props }) => (
  <div className="relative">
    {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5">{icon}</div>}
    <input
      className={`w-full ${icon ? "pl-12" : "pl-5"} pr-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600 ${className}`}
      {...props}
    />
  </div>
);

export default Input;
